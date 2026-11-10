import prisma from '../config/db';
import { PlanCode } from '@prisma/client';

export type PlanTier = 'FREE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type AccessSource = 'FREE' | 'PAID' | 'ADMIN';

export interface UserEntitlement {
  userId: string;
  effectivePlan: PlanTier;
  planName: string;
  dailyMessageLimit: number; // 5 (FREE), 50 (SILVER), 150 (GOLD), -1 (PLATINUM/unlimited)
  accessSource: AccessSource;
  accessExpiresAt: Date | null;
  isUnlimited: boolean;
  sourceId: string | null; // ID of active AdminAccessGrant or Subscription
  canDirectMessage: boolean;
  interestLimit: number;
  profileViewLimit: number;
  contactViewLimit: number;
  features: string[];
}

const TIER_WEIGHTS: Record<PlanTier, number> = {
  FREE: 1,
  SILVER: 2,
  GOLD: 3,
  PLATINUM: 4,
};

/**
 * Standard default fallback limits if database plan is missing
 */
const DEFAULT_TIER_LIMITS: Record<PlanTier, number> = {
  FREE: 5,
  SILVER: 50,
  GOLD: 150,
  PLATINUM: -1,
};

/**
 * Resolves a user's effective membership entitlement in real-time.
 * 
 * Rules:
 * 1. Checks active AdminAccessGrant (status=ACTIVE and (isUnlimited=true or endDate > now))
 * 2. Checks active paid Subscription (status=ACTIVE and endDate > now and plan != FREE)
 * 3. Compares tiers: if both exist, highest tier prevails; if equal, ADMIN prevails.
 * 4. Fallback to FREE plan if no active grant or paid subscription exists.
 * 5. Does NOT mutate or cancel subscriptions when grants expire or are revoked.
 */
export async function getUserEntitlement(userId: string, tx: any = prisma): Promise<UserEntitlement> {
  const now = new Date();

  // 1. Fetch user with active AdminAccessGrant
  const activeGrant = await tx.adminAccessGrant.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      startDate: { lte: now },
      OR: [
        { isUnlimited: true },
        { endDate: { gt: now } },
      ],
    },
    include: { plan: true },
    orderBy: [
      { isUnlimited: 'desc' },
      { endDate: 'desc' },
    ],
  });

  // 2. Fetch user's active paid Subscription (planCode != 'FREE')
  const activePaidSub = await tx.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { gt: now },
      plan: {
        planCode: { not: 'FREE' },
      },
    },
    include: { plan: true },
    orderBy: { endDate: 'desc' },
  });

  // 3. Fetch default FREE plan for fallback attributes
  const freePlan = await tx.membershipPlan.findUnique({
    where: { planCode: 'FREE' },
  });

  // Resolve highest applicable entitlement
  if (activeGrant && activePaidSub) {
    const grantTier = activeGrant.plan.planCode as PlanTier;
    const paidTier = activePaidSub.plan.planCode as PlanTier;

    const grantRank = TIER_WEIGHTS[grantTier] || 1;
    const paidRank = TIER_WEIGHTS[paidTier] || 1;

    if (grantRank >= paidRank) {
      return buildGrantEntitlement(userId, activeGrant);
    } else {
      return buildPaidSubEntitlement(userId, activePaidSub);
    }
  }

  if (activeGrant) {
    return buildGrantEntitlement(userId, activeGrant);
  }

  if (activePaidSub) {
    return buildPaidSubEntitlement(userId, activePaidSub);
  }

  // Fallback: Free Plan
  return buildFreeEntitlement(userId, freePlan);
}

function parseFeatures(rawFeatures?: string | null): string[] {
  if (!rawFeatures) return [];
  try {
    const parsed = JSON.parse(rawFeatures);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildGrantEntitlement(userId: string, grant: any): UserEntitlement {
  const plan = grant.plan;
  const planCode = plan.planCode as PlanTier;
  const dailyMessageLimit = plan.dailyMessageLimit ?? DEFAULT_TIER_LIMITS[planCode] ?? 5;

  return {
    userId,
    effectivePlan: planCode,
    planName: plan.name,
    dailyMessageLimit,
    accessSource: 'ADMIN',
    accessExpiresAt: grant.isUnlimited ? null : grant.endDate,
    isUnlimited: Boolean(grant.isUnlimited),
    sourceId: grant.id,
    canDirectMessage: Boolean(plan.canDirectMessage),
    interestLimit: plan.interestLimit,
    profileViewLimit: plan.profileViewLimit,
    contactViewLimit: plan.contactViewLimit,
    features: parseFeatures(plan.features),
  };
}

function buildPaidSubEntitlement(userId: string, sub: any): UserEntitlement {
  const plan = sub.plan;
  const planCode = plan.planCode as PlanTier;
  const dailyMessageLimit = plan.dailyMessageLimit ?? DEFAULT_TIER_LIMITS[planCode] ?? 50;

  return {
    userId,
    effectivePlan: planCode,
    planName: plan.name,
    dailyMessageLimit,
    accessSource: 'PAID',
    accessExpiresAt: sub.endDate,
    isUnlimited: false,
    sourceId: sub.id,
    canDirectMessage: Boolean(plan.canDirectMessage),
    interestLimit: plan.interestLimit,
    profileViewLimit: plan.profileViewLimit,
    contactViewLimit: plan.contactViewLimit,
    features: parseFeatures(plan.features),
  };
}

function buildFreeEntitlement(userId: string, freePlan: any): UserEntitlement {
  const dailyMessageLimit = freePlan?.dailyMessageLimit ?? DEFAULT_TIER_LIMITS.FREE;

  return {
    userId,
    effectivePlan: 'FREE',
    planName: freePlan?.name || 'Free Starter',
    dailyMessageLimit,
    accessSource: 'FREE',
    accessExpiresAt: null,
    isUnlimited: false,
    sourceId: null,
    canDirectMessage: Boolean(freePlan?.canDirectMessage),
    interestLimit: freePlan?.interestLimit ?? 10,
    profileViewLimit: freePlan?.profileViewLimit ?? 50,
    contactViewLimit: freePlan?.contactViewLimit ?? 2,
    features: parseFeatures(freePlan?.features),
  };
}

export default {
  getUserEntitlement,
};

