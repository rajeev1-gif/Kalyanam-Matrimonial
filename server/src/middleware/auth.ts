import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'matrimonial_jwt_super_secret_key_2026_indian_wedding'
    );

    const user: any = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: {
          include: {
            photos: true,
            religionCommunity: true,
            educationCareer: true,
            location: true,
          }
        },
        subscriptions: {
          where: { status: 'ACTIVE', endDate: { gte: new Date() } },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found or session expired', 401);
    }

    if (user.status === 'SUSPENDED') {
      return errorResponse(res, 'Your account has been suspended. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', 401);
    }
    return errorResponse(res, 'Invalid authentication token', 401);
  }
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null as any;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || 'matrimonial_jwt_super_secret_key_2026_indian_wedding'
    );

    const user: any = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        subscriptions: {
          where: { status: 'ACTIVE', endDate: { gte: new Date() } },
          include: { plan: true },
          take: 1,
        }
      }
    });

    req.user = user || null;
    next();
  } catch (err) {
    req.user = null as any;
    next();
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Access denied. Administrator privileges required.', 403);
  }
  next();
}

export default {
  authenticate,
  optionalAuth,
  requireAdmin,
};
