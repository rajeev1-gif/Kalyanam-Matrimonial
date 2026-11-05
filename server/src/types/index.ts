import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
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

export interface AuthUserPayload {
  id: string;
  email: string;
  role: Role | string;
  mobile?: string;
  profileId?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload | any;
  file?: any;
  files?: any;
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
