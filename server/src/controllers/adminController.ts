import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function getDashboardAnalytics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newRegistrations,
      maleProfiles,
      femaleProfiles,
      activeUsers,
      suspendedUsers,
      pendingReports,
      successfulPayments,
      subscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.profile.count({ where: { gender: 'MALE' } }),
      prisma.profile.count({ where: { gender: 'FEMALE' } }),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.subscription.groupBy({
        by: ['planId'],
        _count: { id: true },
      })
    ]);

    // Fetch plan names for subscription counts
    const plans = await prisma.membershipPlan.findMany();
    const planMap = new Map(plans.map(p => [p.id, p.name]));

    const subscriptionsBreakdown = subscriptions.map(s => ({
      planName: planMap.get(s.planId) || 'Unknown',
      count: s._count.id,
    }));

    return successResponse(res, {
      totalUsers,
      newRegistrations,
      genderStats: {
        male: maleProfiles,
        female: femaleProfiles,
      },
      statusStats: {
        active: activeUsers,
        suspended: suspendedUsers,
      },
      pendingReports,
      revenue: {
        totalAmount: successfulPayments._sum.amount || 0,
        totalTransactions: successfulPayments._count,
      },
      subscriptionsBreakdown,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { search, status, role, page = '1', limit = '15' } = req.query as any;
    const pageNum = Math.max(1, parseInt(page as string));
    const take = Math.min(50, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;
    if (search && (search as string).trim()) {
      const q = (search as string).trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q, mode: 'insensitive' } },
        { profile: { fullName: { contains: q, mode: 'insensitive' } } }
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: {
            include: {
              photos: { where: { isProfilePicture: true } },
              location: true,
            }
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1,
          }
        }
      })
    ]);

    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      mobile: u.mobile,
      role: u.role,
      status: u.status,
      profileCreatedFor: u.profileCreatedFor,
      fullName: u.profile?.fullName || 'N/A',
      gender: u.profile?.gender || 'N/A',
      city: u.profile?.location?.city || 'N/A',
      isVerified: u.profile?.isVerified || false,
      isVisible: u.profile?.isVisible || false,
      photo: u.profile?.photos?.[0]?.url || null,
      plan: u.subscriptions[0]?.plan?.name || 'Free',
      createdAt: u.createdAt,
    }));

    return successResponse(res, {
      users: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params as any;
    const { status, role } = req.body;

    const data: any = {};
    if (status) data.status = status;
    if (role) data.role = role;

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // Log admin activity
    await prisma.adminActivityLog.create({
      data: {
        adminId: req.user.id,
        action: 'UPDATE_USER_STATUS',
        targetType: 'USER',
        targetId: userId,
        details: JSON.stringify(data),
      }
    });

    return successResponse(res, updated, 'User status updated');
  } catch (error) {
    next(error);
  }
}

export async function toggleProfileVerification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { profileId } = req.params as any;
    const { isVerified, isVisible } = req.body;

    const data: any = {};
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (isVisible !== undefined) data.isVisible = isVisible;

    const updated = await prisma.profile.update({
      where: { id: profileId },
      data,
    });

    return successResponse(res, updated, 'Profile moderation settings updated');
  } catch (error) {
    next(error);
  }
}

export async function getReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } }
          }
        },
        reportedUser: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: { select: { fullName: true } }
          }
        }
      }
    });

    return successResponse(res, reports);
  } catch (error) {
    next(error);
  }
}

export async function updateReportStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { reportId } = req.params as any;
    const { status } = req.body; // PENDING, REVIEWED, RESOLVED, DISMISSED

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    return successResponse(res, updated, 'Report status updated');
  } catch (error) {
    next(error);
  }
}

export async function updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { planId } = req.params as any;
    const { price, interestLimit, profileViewLimit, contactViewLimit, isActive, features } = req.body;

    const data: any = {};
    if (price !== undefined) data.price = parseFloat(price);
    if (interestLimit !== undefined) data.interestLimit = parseInt(interestLimit);
    if (profileViewLimit !== undefined) data.profileViewLimit = parseInt(profileViewLimit);
    if (contactViewLimit !== undefined) data.contactViewLimit = parseInt(contactViewLimit);
    if (isActive !== undefined) data.isActive = isActive;
    if (features !== undefined) data.features = JSON.stringify(features);

    const updated = await prisma.membershipPlan.update({
      where: { id: planId },
      data,
    });

    return successResponse(res, updated, 'Plan updated successfully');
  } catch (error) {
    next(error);
  }
}

// Content management: Success stories, Testimonials, FAQs
export async function createSuccessStory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { groomName, brideName, weddingDate, story, couplePhoto, isFeatured } = req.body;
    const created = await prisma.successStory.create({
      data: {
        groomName,
        brideName,
        weddingDate: new Date(weddingDate),
        story,
        couplePhoto,
        isFeatured: isFeatured || false,
      }
    });
    return successResponse(res, created, 'Success story created', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteSuccessStory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as any;
    await prisma.successStory.delete({ where: { id } });
    return successResponse(res, {}, 'Success story deleted');
  } catch (error) {
    next(error);
  }
}

export async function createFaq(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { question, answer, category, orderIndex } = req.body;
    const created = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || 'General',
        orderIndex: orderIndex ? parseInt(orderIndex) : 0,
      }
    });
    return successResponse(res, created, 'FAQ created', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteFaq(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as any;
    await prisma.fAQ.delete({ where: { id } });
    return successResponse(res, {}, 'FAQ deleted');
  } catch (error) {
    next(error);
  }
}


