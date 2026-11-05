-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CreatedFor" AS ENUM ('MYSELF', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'RELATIVE', 'FRIEND');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('NEVER_MARRIED', 'DIVORCED', 'WIDOWED', 'AWAITING_DIVORCE');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('HINDU', 'MUSLIM', 'SIKH', 'CHRISTIAN', 'JAIN', 'BUDDHIST', 'PARSI', 'JEWISH', 'OTHER');

-- CreateEnum
CREATE TYPE "ManglikStatus" AS ENUM ('YES', 'NO', 'DONT_KNOW', 'ANGSHIK');

-- CreateEnum
CREATE TYPE "OccupationType" AS ENUM ('PRIVATE_SECTOR', 'GOVERNMENT', 'BUSINESS', 'DEFENCE', 'SELF_EMPLOYED', 'NOT_WORKING');

-- CreateEnum
CREATE TYPE "ResidentialStatus" AS ENUM ('CITIZEN', 'PERMANENT_RESIDENT', 'WORK_PERMIT', 'STUDENT_VISA');

-- CreateEnum
CREATE TYPE "FamilyType" AS ENUM ('NUCLEAR', 'JOINT');

-- CreateEnum
CREATE TYPE "FamilyValues" AS ENUM ('TRADITIONAL', 'MODERATE', 'LIBERAL');

-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('MIDDLE_CLASS', 'UPPER_MIDDLE_CLASS', 'AFFLUENT', 'HIGH_NET_WORTH');

-- CreateEnum
CREATE TYPE "DietType" AS ENUM ('VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN', 'JAIN', 'VEGAN');

-- CreateEnum
CREATE TYPE "HabitStatus" AS ENUM ('NO', 'OCCASIONALLY', 'YES');

-- CreateEnum
CREATE TYPE "PhotoStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "InterestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INTEREST_RECEIVED', 'INTEREST_ACCEPTED', 'INTEREST_REJECTED', 'NEW_MESSAGE', 'SHORTLISTED', 'PROFILE_VIEW', 'SUBSCRIPTION_UPDATED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PlanCode" AS ENUM ('FREE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "profileCreatedFor" "CreatedFor" NOT NULL DEFAULT 'MYSELF',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "mobileVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "height" INTEGER NOT NULL,
    "maritalStatus" "MaritalStatus" NOT NULL DEFAULT 'NEVER_MARRIED',
    "aboutMe" TEXT,
    "profileSummary" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionPercentage" INTEGER NOT NULL DEFAULT 20,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePhoto" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isProfilePicture" BOOLEAN NOT NULL DEFAULT false,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "status" "PhotoStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfilePhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReligionCommunity" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "religion" "Religion" NOT NULL DEFAULT 'HINDU',
    "community" TEXT NOT NULL DEFAULT 'Not Specified',
    "caste" TEXT,
    "subCaste" TEXT,
    "motherTongue" TEXT NOT NULL DEFAULT 'Hindi',
    "gothra" TEXT,
    "manglik" "ManglikStatus" NOT NULL DEFAULT 'DONT_KNOW',

    CONSTRAINT "ReligionCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationCareer" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "highestEducation" TEXT NOT NULL DEFAULT 'Bachelor',
    "educationField" TEXT,
    "collegeName" TEXT,
    "occupationType" "OccupationType" NOT NULL DEFAULT 'PRIVATE_SECTOR',
    "occupationTitle" TEXT NOT NULL DEFAULT 'Professional',
    "companyName" TEXT,
    "annualIncome" TEXT NOT NULL DEFAULT 'Not Disclosed',
    "currency" TEXT NOT NULL DEFAULT 'INR',

    CONSTRAINT "EducationCareer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'India',
    "state" TEXT NOT NULL DEFAULT 'Delhi',
    "city" TEXT NOT NULL DEFAULT 'New Delhi',
    "citizenship" TEXT NOT NULL DEFAULT 'Indian',
    "residentialStatus" "ResidentialStatus" NOT NULL DEFAULT 'CITIZEN',

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FamilyDetails" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "familyType" "FamilyType" NOT NULL DEFAULT 'NUCLEAR',
    "familyValues" "FamilyValues" NOT NULL DEFAULT 'MODERATE',
    "familyStatus" "FamilyStatus" NOT NULL DEFAULT 'MIDDLE_CLASS',
    "fatherOccupation" TEXT,
    "motherOccupation" TEXT,
    "brothersCount" INTEGER NOT NULL DEFAULT 0,
    "brothersMarried" INTEGER NOT NULL DEFAULT 0,
    "sistersCount" INTEGER NOT NULL DEFAULT 0,
    "sistersMarried" INTEGER NOT NULL DEFAULT 0,
    "aboutFamily" TEXT,

    CONSTRAINT "FamilyDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifestyleDetails" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "diet" "DietType" NOT NULL DEFAULT 'VEGETARIAN',
    "smoking" "HabitStatus" NOT NULL DEFAULT 'NO',
    "drinking" "HabitStatus" NOT NULL DEFAULT 'NO',
    "hobbies" TEXT,
    "interests" TEXT,

    CONSTRAINT "LifestyleDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerPreference" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL DEFAULT 21,
    "maxAge" INTEGER NOT NULL DEFAULT 35,
    "minHeight" INTEGER NOT NULL DEFAULT 150,
    "maxHeight" INTEGER NOT NULL DEFAULT 195,
    "maritalStatus" TEXT,
    "religions" TEXT,
    "communities" TEXT,
    "motherTongues" TEXT,
    "minIncome" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "diet" TEXT,

    CONSTRAINT "PartnerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "InterestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shortlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shortlistedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shortlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "viewedUserId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "planCode" "PlanCode" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationMonths" INTEGER NOT NULL DEFAULT 1,
    "interestLimit" INTEGER NOT NULL DEFAULT 10,
    "profileViewLimit" INTEGER NOT NULL DEFAULT 50,
    "contactViewLimit" INTEGER NOT NULL DEFAULT 5,
    "canDirectMessage" BOOLEAN NOT NULL DEFAULT false,
    "priorityListing" BOOLEAN NOT NULL DEFAULT false,
    "features" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "interestsRemaining" INTEGER NOT NULL,
    "viewsRemaining" INTEGER NOT NULL,
    "contactsRemaining" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "orderId" TEXT NOT NULL,
    "paymentId" TEXT,
    "signature" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedUserId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessStory" (
    "id" TEXT NOT NULL,
    "groomName" TEXT NOT NULL,
    "brideName" TEXT NOT NULL,
    "weddingDate" TIMESTAMP(3) NOT NULL,
    "story" TEXT NOT NULL,
    "couplePhoto" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuccessStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorLocation" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'General',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminActivityLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ReligionCommunity_profileId_key" ON "ReligionCommunity"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "EducationCareer_profileId_key" ON "EducationCareer"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_profileId_key" ON "Location"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyDetails_profileId_key" ON "FamilyDetails"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "LifestyleDetails_profileId_key" ON "LifestyleDetails"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerPreference_profileId_key" ON "PartnerPreference"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "Interest_senderId_receiverId_key" ON "Interest"("senderId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Shortlist_userId_shortlistedUserId_key" ON "Shortlist"("userId", "shortlistedUserId");

-- CreateIndex
CREATE INDEX "ProfileView_viewerId_viewedUserId_idx" ON "ProfileView"("viewerId", "viewedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_user1Id_user2Id_key" ON "Conversation"("user1Id", "user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "MembershipPlan_planCode_key" ON "MembershipPlan"("planCode");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedUserId_key" ON "Block"("blockerId", "blockedUserId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePhoto" ADD CONSTRAINT "ProfilePhoto_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReligionCommunity" ADD CONSTRAINT "ReligionCommunity_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationCareer" ADD CONSTRAINT "EducationCareer_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyDetails" ADD CONSTRAINT "FamilyDetails_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifestyleDetails" ADD CONSTRAINT "LifestyleDetails_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerPreference" ADD CONSTRAINT "PartnerPreference_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interest" ADD CONSTRAINT "Interest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shortlist" ADD CONSTRAINT "Shortlist_shortlistedUserId_fkey" FOREIGN KEY ("shortlistedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewedUserId_fkey" FOREIGN KEY ("viewedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MembershipPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminActivityLog" ADD CONSTRAINT "AdminActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
