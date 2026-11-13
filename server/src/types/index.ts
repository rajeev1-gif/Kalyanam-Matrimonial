import { Request, Response, NextFunction } from 'express';
import 'multer';
import {
  Role,
  UserStatus,
  CreatedFor,
  Gender,
  MaritalStatus,
  Religion,
  ManglikStatus,
  OccupationType,
  ResidentialStatus,
  FamilyType,
  FamilyValues,
  FamilyStatus,
  DietType,
  HabitStatus,
  PhotoStatus,
  InterestStatus,
  NotificationType,
  PlanCode,
  SubscriptionStatus,
  PaymentStatus,
  ReportStatus
} from '@prisma/client';

export {
  Role,
  UserStatus,
  CreatedFor,
  Gender,
  MaritalStatus,
  Religion,
  ManglikStatus,
  OccupationType,
  ResidentialStatus,
  FamilyType,
  FamilyValues,
  FamilyStatus,
  DietType,
  HabitStatus,
  PhotoStatus,
  InterestStatus,
  NotificationType,
  PlanCode,
  SubscriptionStatus,
  PaymentStatus,
  ReportStatus
};

export interface AuthUserSubscription {
  id: string;
  userId?: string;
  planId?: string;
  status?: SubscriptionStatus | string;
  startDate?: Date | string;
  endDate?: Date | string;
  interestsRemaining?: number;
  viewsRemaining?: number;
  contactsRemaining?: number;
  plan?: {
    id?: string;
    name?: string;
    planCode?: PlanCode | string;
    dailyMessageLimit?: number;
    canDirectMessage?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AuthUserProfile {
  id?: string;
  userId?: string;
  fullName?: string;
  gender?: Gender | string;
  photos?: Array<{ id?: string; url?: string; isProfilePicture?: boolean; [key: string]: unknown }>;
  [key: string]: unknown;
}

export interface AuthUserPayload {
  id: string;
  email: string;
  role: Role | string;
  mobile?: string;
  status?: UserStatus | string;
  profileId?: string;
  profile?: AuthUserProfile | null;
  subscriptions?: AuthUserSubscription[];
  [key: string]: unknown;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export type AsyncRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

export interface RegisterDto {
  fullName: string;
  email: string;
  mobile: string;
  password?: string;
  gender: string;
  profileCreatedFor?: string;
  dateOfBirth?: string;
  religion?: string;
  motherTongue?: string;
}

export interface LoginDto {
  email?: string;
  mobile?: string;
  identifier?: string;
  password?: string;
}
