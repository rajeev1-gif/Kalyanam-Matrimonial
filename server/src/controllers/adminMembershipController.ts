import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { getUserEntitlement } from '../services/entitlementService';
import { PlanCode, GrantStatus, MembershipAuditAction } from '@prisma/client';

/**
 * Helper to compute effective display status of an AdminAccessGrant
 */
function getGrantDisplayStatus(grant: { status: GrantStatus; isUnlimited: boolean; endDate: Date | null }): 'ACTIVE' | 'EXPIRED' | 'REVOKED' {
  if (grant.status === 'REVOKED') return 'REVOKED';
  if (!grant.isUnlimited && grant.endDate && new Date(grant.endDate) < new Date()) {
    return 'EXPIRED';
  }
  return 'ACTIVE';
}

/**
 * POST /api/admin/memberships/grant
 * Grant manual membership plan access to a user.
 */
export async function grantMembership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user.id;
    const { userId, planCode, duration, isUnlimited, reason } = req.body;

    // 1. Mandatory reason check
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return errorResponse(res, 'A mandatory reason is required to grant membership access.', 400);
    }

    // 2. User validation
    if (!userId) {
      return errorResponse(res, 'Target userId is required.', 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!targetUser) {
      return errorResponse(res, 'Target user does not exist.', 404);
    }

    // 3. Plan validation
    if (!planCode || !Object.values(PlanCode).includes(planCode as PlanCode)) {
      return errorResponse(res, `Invalid planCode. Must be one of: ${Object.values(PlanCode).join(', ')}`, 400);
    }

    const targetPlan = await prisma.membershipPlan.findUnique({
      where: { planCode: planCode as PlanCode },
    });

    if (!targetPlan) {
      return errorResponse(res, `Membership plan ${planCode} not found.`, 404);
    }

    // 4. Duration validation
    const unlimited = Boolean(isUnlimited || duration === 'unlimited' || duration === -1);
    let durationDays: number | null = null;

    if (!unlimited) {
      const parsedDays = parseInt(duration, 10);
      if (isNaN(parsedDays) || parsedDays <= 0) {
        return errorResponse(res, 'Duration must be a positive number of days or marked as unlimited.', 400);
      }
      durationDays = parsedDays;
    }

    const startDate = new Date();
    const endDate = unlimited || !durationDays
      ? null
      : new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 5. Execute in database transaction: Grant creation + Audit log
    const result = await prisma.$transaction(async (tx) => {
      // Fetch prior entitlement
      const prevEntitlement = await getUserEntitlement(userId, tx);

      // If user had existing ACTIVE grants, mark them superseded/EXPIRED
      await tx.adminAccessGrant.updateMany({
        where: {
          userId,
          status: 'ACTIVE',
        },
        data: {
          status: 'EXPIRED',
        },
      });

      // Create new grant
      const grant = await tx.adminAccessGrant.create({
        data: {
          userId,
          adminId,
          planId: targetPlan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
          isUnlimited: unlimited,
          reason: reason.trim(),
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              email: true,
              mobile: true,
              profile: { select: { fullName: true } },
            },
          },
          admin: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      // Create audit log
      await tx.membershipAuditLog.create({
        data: {
          userId,
          performedById: adminId,
          action: MembershipAuditAction.ADMIN_GRANT,
          planCode: targetPlan.planCode,
          fromPlan: prevEntitlement.effectivePlan,
          toPlan: targetPlan.planCode,
          source: 'ADMIN',
          reason: reason.trim(),
          metadata: JSON.stringify({
            grantId: grant.id,
            durationDays: unlimited ? null : durationDays,
            isUnlimited: unlimited,
            startDate: startDate.toISOString(),
            endDate: endDate ? endDate.toISOString() : null,
          }),
        },
      });

      // Re-evaluate real-time entitlement
      const newEntitlement = await getUserEntitlement(userId, tx);

      return {
        grant: {
          ...grant,
          displayStatus: getGrantDisplayStatus(grant),
        },
        effectiveEntitlement: newEntitlement,
      };
    });

    return successResponse(res, result, 'Membership access granted successfully', 201);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/memberships/:id/extend
 * Extend duration of an active admin access grant.
 */
export async function extendMembership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user.id;
    const { id } = req.params as any;
    const { additionalDays, reason } = req.body;

    // 1. Mandatory reason check
    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return errorResponse(res, 'A mandatory reason is required to extend membership duration.', 400);
    }

    // 2. Validate additionalDays
    const days = parseInt(additionalDays, 10);
    if (isNaN(days) || days <= 0) {
      return errorResponse(res, 'additionalDays must be a positive integer.', 400);
    }

    // 3. Find target grant
    const existingGrant = await prisma.adminAccessGrant.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!existingGrant) {
      return errorResponse(res, 'Admin access grant not found.', 404);
    }

    if (existingGrant.status === 'REVOKED') {
      return errorResponse(res, 'Cannot extend a revoked membership grant.', 400);
    }

    if (existingGrant.isUnlimited || !existingGrant.endDate) {
      return errorResponse(res, 'Cannot extend an unlimited duration grant as it has no expiration date.', 400);
    }

    // 4. Calculate new expiration date
    const now = new Date();
    const baseDate = existingGrant.endDate > now ? existingGrant.endDate : now;
    const newEndDate = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

    // 5. Execute extension & audit log inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedGrant = await tx.adminAccessGrant.update({
        where: { id },
        data: {
          endDate: newEndDate,
          status: 'ACTIVE',
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              email: true,
              mobile: true,
              profile: { select: { fullName: true } },
            },
          },
          admin: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      await tx.membershipAuditLog.create({
        data: {
          userId: existingGrant.userId,
          performedById: adminId,
          action: MembershipAuditAction.ADMIN_EXTEND,
          planCode: existingGrant.plan.planCode,
          fromPlan: existingGrant.plan.planCode,
          toPlan: existingGrant.plan.planCode,
          source: 'ADMIN',
          reason: reason.trim(),
          metadata: JSON.stringify({
            grantId: existingGrant.id,
            additionalDays: days,
            previousEndDate: existingGrant.endDate.toISOString(),
            newEndDate: newEndDate.toISOString(),
          }),
        },
      });

      const newEntitlement = await getUserEntitlement(existingGrant.userId, tx);

      return {
        grant: {
          ...updatedGrant,
          displayStatus: getGrantDisplayStatus(updatedGrant),
        },
        effectiveEntitlement: newEntitlement,
      };
    });

    return successResponse(res, result, 'Membership duration extended successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/memberships/:id/revoke
 * Revoke an admin access grant with mandatory reason.
 */
export async function revokeMembership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user.id;
    const { id } = req.params as any;
    const { revocationReason } = req.body;

    // 1. Mandatory reason check
    if (!revocationReason || typeof revocationReason !== 'string' || !revocationReason.trim()) {
      return errorResponse(res, 'A mandatory revocation reason is required.', 400);
    }

    // 2. Find target grant
    const existingGrant = await prisma.adminAccessGrant.findUnique({
      where: { id },
      include: { plan: true },
    });

    if (!existingGrant) {
      return errorResponse(res, 'Admin access grant not found.', 404);
    }

    if (existingGrant.status === 'REVOKED') {
      return errorResponse(res, 'This grant is already revoked.', 400);
    }

    // 3. Execute revocation & audit log inside transaction
    const result = await prisma.$transaction(async (tx) => {
      const revokedGrant = await tx.adminAccessGrant.update({
        where: { id },
        data: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedByAdminId: adminId,
          revocationReason: revocationReason.trim(),
        },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              email: true,
              mobile: true,
              profile: { select: { fullName: true } },
            },
          },
          admin: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          revokingAdmin: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      // Recalculate effective entitlement (falls back to paid sub or FREE)
      const fallbackEntitlement = await getUserEntitlement(existingGrant.userId, tx);

      await tx.membershipAuditLog.create({
        data: {
          userId: existingGrant.userId,
          performedById: adminId,
          action: MembershipAuditAction.ADMIN_REVOKE,
          planCode: existingGrant.plan.planCode,
          fromPlan: existingGrant.plan.planCode,
          toPlan: fallbackEntitlement.effectivePlan,
          source: 'ADMIN',
          reason: revocationReason.trim(),
          metadata: JSON.stringify({
            grantId: existingGrant.id,
            revokedAt: new Date().toISOString(),
            fallbackPlan: fallbackEntitlement.effectivePlan,
            fallbackSource: fallbackEntitlement.accessSource,
          }),
        },
      });

      return {
        grant: {
          ...revokedGrant,
          displayStatus: 'REVOKED',
        },
        fallbackEntitlement,
      };
    });

    return successResponse(res, result, 'Membership access revoked successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/memberships
 * Search and list all admin grants with effective entitlement, filtering and pagination.
 */
export async function getMemberships(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { search, plan, status, page = '1', limit = '15' } = req.query as any;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit as string) || 15));
    const skip = (pageNum - 1) * take;

    const now = new Date();
    const where: any = {};

    // Filter by Plan
    if (plan && Object.values(PlanCode).includes(plan as PlanCode)) {
      where.plan = { planCode: plan as PlanCode };
    }

    // Filter by Status
    if (status) {
      const upperStatus = (status as string).toUpperCase();
      if (upperStatus === 'ACTIVE') {
        where.status = 'ACTIVE';
        where.OR = [
          { isUnlimited: true },
          { endDate: { gte: now } },
        ];
      } else if (upperStatus === 'EXPIRED') {
        where.OR = [
          { status: 'EXPIRED' },
          { status: 'ACTIVE', isUnlimited: false, endDate: { lt: now } },
        ];
      } else if (upperStatus === 'REVOKED') {
        where.status = 'REVOKED';
      }
    }

    // Filter by Search (User name, email, mobile)
    if (search && (search as string).trim()) {
      const q = (search as string).trim();
      where.user = {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { mobile: { contains: q, mode: 'insensitive' } },
          { profile: { fullName: { contains: q, mode: 'insensitive' } } },
        ],
      };
    }

    const [total, grants] = await Promise.all([
      prisma.adminAccessGrant.count({ where }),
      prisma.adminAccessGrant.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
          user: {
            select: {
              id: true,
              email: true,
              mobile: true,
              status: true,
              profile: {
                select: {
                  fullName: true,
                  gender: true,
                  photos: { where: { isProfilePicture: true }, take: 1 },
                },
              },
            },
          },
          admin: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          revokingAdmin: {
            select: {
              id: true,
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      }),
    ]);

    // Enhance each grant with user's current effective entitlement
    const formatted = await Promise.all(
      grants.map(async (g) => {
        const entitlement = await getUserEntitlement(g.userId);
        return {
          id: g.id,
          userId: g.userId,
          userName: g.user.profile?.fullName || 'N/A',
          userEmail: g.user.email,
          userMobile: g.user.mobile,
          userPhoto: g.user.profile?.photos?.[0]?.url || null,
          userStatus: g.user.status,
          planCode: g.plan.planCode,
          planName: g.plan.name,
          dailyMessageLimit: g.plan.dailyMessageLimit,
          isUnlimited: g.isUnlimited,
          startDate: g.startDate,
          endDate: g.endDate,
          status: g.status,
          displayStatus: getGrantDisplayStatus(g),
          reason: g.reason,
          grantedByAdmin: g.admin.profile?.fullName || g.admin.email,
          revokedAt: g.revokedAt,
          revokedByAdmin: g.revokingAdmin ? (g.revokingAdmin.profile?.fullName || g.revokingAdmin.email) : null,
          revocationReason: g.revocationReason,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
          currentEntitlement: {
            effectivePlan: entitlement.effectivePlan,
            accessSource: entitlement.accessSource,
            dailyLimit: entitlement.dailyMessageLimit,
            isUnlimited: entitlement.isUnlimited,
            accessExpiresAt: entitlement.accessExpiresAt,
          },
        };
      })
    );

    return successResponse(res, {
      grants: formatted,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/memberships/:id
 * Retrieve details of a single grant.
 */
export async function getMembershipById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as any;

    const grant = await prisma.adminAccessGrant.findUnique({
      where: { id },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            email: true,
            mobile: true,
            status: true,
            profile: {
              select: {
                fullName: true,
                gender: true,
                photos: { where: { isProfilePicture: true }, take: 1 },
              },
            },
          },
        },
        admin: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        revokingAdmin: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    if (!grant) {
      return errorResponse(res, 'Membership grant not found.', 404);
    }

    const entitlement = await getUserEntitlement(grant.userId);

    // Fetch user's audit logs
    const auditLogs = await prisma.membershipAuditLog.findMany({
      where: { userId: grant.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        performedBy: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    return successResponse(res, {
      grant: {
        ...grant,
        displayStatus: getGrantDisplayStatus(grant),
      },
      currentEntitlement: entitlement,
      auditLogs,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/memberships/users/:userId/history
 * Retrieve full membership audit history for a user.
 */
export async function getUserMembershipHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params as any;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        mobile: true,
        profile: { select: { fullName: true } },
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const [entitlement, logs] = await Promise.all([
      getUserEntitlement(userId),
      prisma.membershipAuditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: {
            select: {
              id: true,
              email: true,
              role: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      }),
    ]);

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      action: log.action,
      planCode: log.planCode,
      fromPlan: log.fromPlan,
      toPlan: log.toPlan,
      source: log.source,
      reason: log.reason,
      metadata: log.metadata ? JSON.parse(log.metadata) : null,
      performedBy: log.performedBy
        ? {
            id: log.performedBy.id,
            email: log.performedBy.email,
            fullName: log.performedBy.profile?.fullName || log.performedBy.email,
            role: log.performedBy.role,
          }
        : { fullName: 'System / Automated' },
      createdAt: log.createdAt,
    }));

    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        fullName: user.profile?.fullName || 'N/A',
      },
      currentEntitlement: entitlement,
      logs: formattedLogs,
    });
  } catch (error) {
    next(error);
  }
}

export default {
  grantMembership,
  extendMembership,
  revokeMembership,
  getMemberships,
  getMembershipById,
  getUserMembershipHistory,
};

