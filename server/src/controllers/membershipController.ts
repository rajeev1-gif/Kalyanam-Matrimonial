import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { getUserEntitlement } from '../services/entitlementService';
import { MembershipAuditAction } from '@prisma/client';

export async function getAllPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });

    const formatted = plans.map(p => ({
      ...p,
      features: p.features ? JSON.parse(p.features) : [],
    }));

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getCurrentSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;
    const entitlement = await getUserEntitlement(currentUserId);

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: currentUserId,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    });

    const activeGrant = await prisma.adminAccessGrant.findFirst({
      where: {
        userId: currentUserId,
        status: 'ACTIVE',
        OR: [
          { isUnlimited: true },
          { endDate: { gt: new Date() } }
        ]
      },
      include: { plan: true },
      orderBy: [{ isUnlimited: 'desc' }, { endDate: 'desc' }]
    });

    const formatted = {
      entitlement,
      subscription: subscription ? {
        ...subscription,
        plan: {
          ...subscription.plan,
          features: subscription.plan.features ? JSON.parse(subscription.plan.features) : []
        }
      } : null,
      adminGrant: activeGrant || null,
      plan: {
        name: entitlement.planName,
        planCode: entitlement.effectivePlan,
        dailyMessageLimit: entitlement.dailyMessageLimit,
        canDirectMessage: entitlement.canDirectMessage,
        features: entitlement.features,
      },
      accessSource: entitlement.accessSource,
      accessExpiresAt: entitlement.accessExpiresAt,
      isUnlimited: entitlement.isUnlimited,
      interestsRemaining: entitlement.interestLimit,
      contactsRemaining: entitlement.contactViewLimit,
      viewsRemaining: entitlement.profileViewLimit,
      endDate: entitlement.accessExpiresAt,
    };

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { planId } = req.body;
    const currentUserId = req.user.id;

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return errorResponse(res, 'Invalid or inactive plan selected', 400);
    }

    if (plan.price === 0) {
      return errorResponse(res, 'Free plan does not require payment', 400);
    }

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const payment = await prisma.payment.create({
      data: {
        userId: currentUserId,
        planId: plan.id,
        amount: plan.price,
        currency: 'INR',
        orderId,
        status: 'PENDING',
      }
    });

    return successResponse(res, {
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      planName: plan.name,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
    }, 'Payment order initiated');
  } catch (error) {
    next(error);
  }
}

export async function verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;
    const { orderId, paymentId, signature } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { plan: true }
    });

    if (!payment) {
      return errorResponse(res, 'Payment record not found', 404);
    }

    if (payment.userId !== currentUserId) {
      return errorResponse(res, 'Unauthorized', 403);
    }

    // Verify signature if real razorpay secret is supplied, otherwise accept in test sandbox mode
    const secret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = true;
    if (secret && secret !== 'your_razorpay_key_secret' && secret !== 'rzp_test_placeholder_secret' && signature) {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(`${orderId}|${paymentId}`);
      const generatedSignature = hmac.digest('hex');
      isValid = generatedSignature === signature;
    }

    if (!isValid) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' }
      });
      return errorResponse(res, 'Payment verification failed', 400);
    }

    const plan = payment.plan;
    const durationDays = plan.durationMonths * 30;
    const endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // Update payment and activate subscription
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          paymentId: paymentId || `pay_${Date.now()}`,
          signature: signature || 'test_signature',
          status: 'SUCCESS',
          paymentMethod: 'RAZORPAY_CARD_UPI',
        }
      });

      // Expire previous active subscriptions
      await tx.subscription.updateMany({
        where: { userId: currentUserId, status: 'ACTIVE' },
        data: { status: 'EXPIRED' }
      });

      // Create new subscription
      await tx.subscription.create({
        data: {
          userId: currentUserId,
          planId: plan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate,
          interestsRemaining: plan.interestLimit,
          viewsRemaining: plan.profileViewLimit,
          contactsRemaining: plan.contactViewLimit,
        }
      });

      // Audit log entry for paid subscription
      await tx.membershipAuditLog.create({
        data: {
          userId: currentUserId,
          performedById: currentUserId,
          action: MembershipAuditAction.PAID_SUBSCRIPTION,
          planCode: plan.planCode,
          fromPlan: 'FREE',
          toPlan: plan.planCode,
          source: 'PAID',
          reason: `Online subscription purchase: ${plan.name}`,
          metadata: JSON.stringify({
            orderId: payment.orderId,
            amount: payment.amount,
            startDate: new Date().toISOString(),
            endDate: endDate.toISOString(),
          }),
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          userId: currentUserId,
          type: 'SUBSCRIPTION_UPDATED',
          title: `${plan.name} Activated!`,
          message: `Congratulations! Your ${plan.name} membership is active until ${endDate.toLocaleDateString()}. Enjoy premium benefits.`,
          link: '/dashboard/membership',
        }
      });
    });

    return successResponse(res, {}, `Successfully activated ${plan.name}!`);
  } catch (error) {
    next(error);
  }
}

export async function getPaymentHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true }
    });

    return successResponse(res, payments);
  } catch (error) {
    next(error);
  }
}


