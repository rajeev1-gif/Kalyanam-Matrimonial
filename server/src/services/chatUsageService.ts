import prisma from '../config/db';
import { getUserEntitlement, UserEntitlement } from './entitlementService';

export class DailyLimitReachedError extends Error {
  code: string;
  statusCode: number;
  data: {
    effectivePlan: string;
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
    resetTimezone: string;
    resetsAt: string;
  };

  constructor(entitlement: UserEntitlement, usedToday: number) {
    super('You have reached your daily messaging limit. Upgrade your membership to continue chatting.');
    this.name = 'DailyLimitReachedError';
    this.code = 'DAILY_MESSAGE_LIMIT_REACHED';
    this.statusCode = 403;
    this.data = {
      effectivePlan: entitlement.effectivePlan,
      dailyLimit: entitlement.dailyMessageLimit,
      usedToday,
      remainingToday: 0,
      resetTimezone: 'Asia/Kolkata',
      resetsAt: getNextKolkataMidnight().toISOString(),
    };
  }
}

/**
 * Returns the current date key (YYYY-MM-DD) in Asia/Kolkata timezone.
 */
export function getKolkataDateKey(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Returns the exact Date of the next midnight in Asia/Kolkata (IST: UTC+5:30).
 */
export function getNextKolkataMidnight(date: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);

  // Tomorrow at 00:00:00 IST (+05:30)
  const tomorrowUtc = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0));
  // Subtract 5 hours 30 mins to get corresponding UTC timestamp
  const nextMidnightUtc = new Date(tomorrowUtc.getTime() - (5 * 60 + 30) * 60 * 1000);
  return nextMidnightUtc;
}

/**
 * Gets a user's current daily chat usage and remaining allowance.
 */
export async function getDailyUsage(userId: string) {
  const dateKey = getKolkataDateKey();
  const [entitlement, usage] = await Promise.all([
    getUserEntitlement(userId),
    prisma.chatUsage.findUnique({
      where: { userId_dateKey: { userId, dateKey } },
    }),
  ]);

  const usedToday = usage?.messageCount || 0;
  const dailyLimit = entitlement.dailyMessageLimit;
  const isUnlimited = dailyLimit === -1;
  const remainingToday = isUnlimited ? -1 : Math.max(0, dailyLimit - usedToday);
  const resetsAt = getNextKolkataMidnight();

  return {
    userId,
    effectivePlan: entitlement.effectivePlan,
    planName: entitlement.planName,
    accessSource: entitlement.accessSource,
    dailyLimit,
    usedToday,
    remainingToday,
    isUnlimited,
    accessExpiresAt: entitlement.accessExpiresAt,
    resetsAt: resetsAt.toISOString(),
    resetTimezone: 'Asia/Kolkata',
  };
}

/**
 * Atomically checks and reserves message quota inside an active transaction.
 * Uses PostgreSQL row-level locking (SELECT ... FOR UPDATE) to guarantee that
 * concurrent requests cannot bypass the daily messaging limit.
 */
export async function reserveQuotaAndCreateMessage(
  tx: any,
  params: {
    senderId: string;
    targetConvId: string;
    targetReceiverId: string;
    content: string;
  }
) {
  const { senderId, targetConvId, targetReceiverId, content } = params;
  const dateKey = getKolkataDateKey();

  // 1. Resolve sender entitlement inside the transaction
  const entitlement = await getUserEntitlement(senderId, tx);
  const isUnlimited = entitlement.dailyMessageLimit === -1;

  if (!isUnlimited) {
    // 2. Ensure ChatUsage row exists
    await tx.chatUsage.upsert({
      where: { userId_dateKey: { userId: senderId, dateKey } },
      create: { userId: senderId, dateKey, messageCount: 0 },
      update: {},
    });

    // 3. Acquire exclusive row-level lock (FOR UPDATE)
    const usageRows: any = await tx.$queryRawUnsafe(
      `SELECT "id", "messageCount" FROM "ChatUsage" WHERE "userId" = $1 AND "dateKey" = $2 FOR UPDATE;`,
      senderId,
      dateKey
    );

    const currentUsage = usageRows[0]?.messageCount || 0;

    if (currentUsage >= entitlement.dailyMessageLimit) {
      throw new DailyLimitReachedError(entitlement, currentUsage);
    }

    // 4. Increment usage within the locked transaction
    await tx.$executeRawUnsafe(
      `UPDATE "ChatUsage" SET "messageCount" = "messageCount" + 1, "updatedAt" = NOW() WHERE "userId" = $1 AND "dateKey" = $2;`,
      senderId,
      dateKey
    );
  } else {
    // Unlimited plan: update usage for reporting without quota restrictions
    await tx.chatUsage.upsert({
      where: { userId_dateKey: { userId: senderId, dateKey } },
      create: { userId: senderId, dateKey, messageCount: 1 },
      update: { messageCount: { increment: 1 } },
    });
  }

  // 5. Create Message in the exact same transaction
  const message = await tx.message.create({
    data: {
      conversationId: targetConvId,
      senderId,
      content: content.trim(),
    },
  });

  // 6. Update Conversation timestamp
  await tx.conversation.update({
    where: { id: targetConvId },
    data: { lastMessageAt: new Date() },
  });

  return { message, entitlement };
}

export default {
  getKolkataDateKey,
  getNextKolkataMidnight,
  getDailyUsage,
  reserveQuotaAndCreateMessage,
  DailyLimitReachedError,
};

