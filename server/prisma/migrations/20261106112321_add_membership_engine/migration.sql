-- CreateEnum
CREATE TYPE "GrantStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "MembershipAuditAction" AS ENUM ('ADMIN_GRANT', 'ADMIN_EXTEND', 'ADMIN_REVOKE', 'PAID_SUBSCRIPTION', 'FALLBACK_TO_FREE');

-- AlterTable
ALTER TABLE "MembershipPlan" ADD COLUMN     "dailyMessageLimit" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "AdminAccessGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "GrantStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokedByAdminId" TEXT,
    "revocationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dateKey" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipAuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "performedById" TEXT,
    "action" "MembershipAuditAction" NOT NULL,
    "planCode" TEXT NOT NULL,
    "fromPlan" TEXT,
    "toPlan" TEXT,
    "source" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAccessGrant_userId_status_idx" ON "AdminAccessGrant"("userId", "status");

-- CreateIndex
CREATE INDEX "AdminAccessGrant_status_endDate_idx" ON "AdminAccessGrant"("status", "endDate");

-- CreateIndex
CREATE INDEX "ChatUsage_userId_dateKey_idx" ON "ChatUsage"("userId", "dateKey");

-- CreateIndex
CREATE UNIQUE INDEX "ChatUsage_userId_dateKey_key" ON "ChatUsage"("userId", "dateKey");

-- CreateIndex
CREATE INDEX "MembershipAuditLog_userId_createdAt_idx" ON "MembershipAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MembershipAuditLog_action_createdAt_idx" ON "MembershipAuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "AdminAccessGrant" ADD CONSTRAINT "AdminAccessGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAccessGrant" ADD CONSTRAINT "AdminAccessGrant_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAccessGrant" ADD CONSTRAINT "AdminAccessGrant_revokedByAdminId_fkey" FOREIGN KEY ("revokedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAccessGrant" ADD CONSTRAINT "AdminAccessGrant_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUsage" ADD CONSTRAINT "ChatUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipAuditLog" ADD CONSTRAINT "MembershipAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipAuditLog" ADD CONSTRAINT "MembershipAuditLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Data migration: configure dailyMessageLimit for each membership tier
UPDATE "MembershipPlan" SET "dailyMessageLimit" = 5 WHERE "planCode" = 'FREE';
UPDATE "MembershipPlan" SET "dailyMessageLimit" = 50 WHERE "planCode" = 'SILVER';
UPDATE "MembershipPlan" SET "dailyMessageLimit" = 150 WHERE "planCode" = 'GOLD';
UPDATE "MembershipPlan" SET "dailyMessageLimit" = -1 WHERE "planCode" = 'PLATINUM';

