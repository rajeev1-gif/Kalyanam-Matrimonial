const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function getNotifications(req, res, next) {
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

async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
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

async function markAllAsRead(req, res, next) {
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

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

