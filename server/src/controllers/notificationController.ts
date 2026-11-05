import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: currentUserId, isRead: false },
    });

    return successResponse(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params as any;
    const currentUserId = req.user.id;

    await prisma.notification.updateMany({
      where: { id, userId: currentUserId },
      data: { isRead: true },
    });

    return successResponse(res, {}, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;

    await prisma.notification.updateMany({
      where: { userId: currentUserId, isRead: false },
      data: { isRead: true },
    });

    return successResponse(res, {}, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
}


