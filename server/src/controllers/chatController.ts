import { Response, NextFunction } from 'express';
import prisma from '../config/db';
import { successResponse, errorResponse } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { getUserEntitlement } from '../services/entitlementService';
import {
  reserveQuotaAndCreateMessage,
  getDailyUsage,
  DailyLimitReachedError,
} from '../services/chatUsageService';

export { DailyLimitReachedError };

export async function getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        user1: {
          select: {
            id: true,
            profile: {
              include: {
                photos: { where: { isProfilePicture: true } },
              }
            }
          }
        },
        user2: {
          select: {
            id: true,
            profile: {
              include: {
                photos: { where: { isProfilePicture: true } },
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        }
      }
    });

    const formatted = await Promise.all(conversations.map(async (conv) => {
      const isUser1 = conv.user1Id === currentUserId;
      const partner = isUser1 ? conv.user2 : conv.user1;

      // Count unread messages sent to current user in this conversation
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: partner.id,
          isRead: false,
        }
      });

      return {
        id: conv.id,
        partnerId: partner.id,
        partnerName: partner.profile?.fullName || 'Member',
        partnerPhoto: partner.profile?.photos?.[0]?.url || null,
        lastMessage: conv.messages[0]?.content || '',
        lastMessageAt: conv.messages[0]?.createdAt || conv.lastMessageAt,
        unreadCount,
      };
    }));

    return successResponse(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;
    const { conversationId } = req.params as any;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user1: {
          select: {
            id: true,
            profile: {
              include: { photos: { where: { isProfilePicture: true } } }
            }
          }
        },
        user2: {
          select: {
            id: true,
            profile: {
              include: { photos: { where: { isProfilePicture: true } } }
            }
          }
        }
      }
    });

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404);
    }

    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return errorResponse(res, 'Unauthorized to view this conversation', 403);
    }

    // Mark unread messages sent by the partner as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: currentUserId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    const partner = conversation.user1Id === currentUserId ? conversation.user2 : conversation.user1;

    return successResponse(res, {
      messages,
      partner: {
        id: partner.id,
        fullName: partner.profile?.fullName,
        photo: partner.profile?.photos?.[0]?.url || null,
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Shared core business logic for sending a message with atomic quota reservation.
 * Reused identically by both REST API and Socket.IO handlers.
 */
export async function sendMessageCore(params: {
  senderId: string;
  senderName?: string;
  conversationId?: string;
  receiverId?: string;
  content: string;
  io?: any;
}) {
  const { senderId, senderName, conversationId, receiverId, content, io } = params;

  if (!content || !content.trim()) {
    const err: any = new Error('Message text cannot be empty');
    err.statusCode = 400;
    throw err;
  }

  let targetConvId = conversationId;
  let targetReceiverId = receiverId;

  if (targetConvId) {
    const conv = await prisma.conversation.findUnique({ where: { id: targetConvId } });
    if (!conv) {
      const err: any = new Error('Conversation not found');
      err.statusCode = 404;
      throw err;
    }
    if (conv.user1Id !== senderId && conv.user2Id !== senderId) {
      const err: any = new Error('Unauthorized to send messages in this conversation');
      err.statusCode = 403;
      throw err;
    }
    targetReceiverId = conv.user1Id === senderId ? conv.user2Id : conv.user1Id;
  } else if (targetReceiverId) {
    // Find or create conversation
    const [u1, u2] = [senderId, targetReceiverId].sort();
    const conv = await prisma.conversation.upsert({
      where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
      create: { user1Id: u1, user2Id: u2 },
      update: {}
    });
    targetConvId = conv.id;
  } else {
    const err: any = new Error('Conversation ID or Receiver ID is required');
    err.statusCode = 400;
    throw err;
  }

  // Check if either user is blocked
  const isBlocked = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: senderId, blockedUserId: targetReceiverId },
        { blockerId: targetReceiverId, blockedUserId: senderId },
      ]
    }
  });
  if (isBlocked) {
    const err: any = new Error('Cannot send message to this user');
    err.statusCode = 403;
    throw err;
  }

  // Resolve current membership entitlement
  const entitlement = await getUserEntitlement(senderId);

  // Check mutual accepted connection or direct messaging privilege
  const connection = await prisma.interest.findFirst({
    where: {
      OR: [
        { senderId, receiverId: targetReceiverId, status: 'ACCEPTED' },
        { senderId: targetReceiverId, receiverId: senderId, status: 'ACCEPTED' },
      ]
    }
  });

  if (!connection && !entitlement.canDirectMessage) {
    const err: any = new Error('Direct messaging requires an accepted connection or a premium membership.');
    err.statusCode = 403;
    throw err;
  }

  // Execute atomic quota reservation, message creation, and conversation update
  const { message } = await prisma.$transaction(async (tx) => {
    // 1. Atomically check and reserve message quota
    const res = await reserveQuotaAndCreateMessage(tx, {
      senderId,
      targetConvId: targetConvId!,
      targetReceiverId: targetReceiverId!,
      content,
    });

    // 2. Create in-app notification for receiver inside same transaction
    await tx.notification.create({
      data: {
        userId: targetReceiverId!,
        type: 'NEW_MESSAGE',
        title: `New Message from ${senderName || 'a match'}`,
        message: content.trim().length > 60 ? content.trim().substring(0, 57) + '...' : content.trim(),
        link: '/dashboard/messages',
      }
    });

    return res;
  });

  // Broadcast via Socket.IO only after database commit succeeds
  if (io) {
    io.to(`user_${targetReceiverId}`).emit('receive_message', {
      ...message,
      senderName,
    });
    io.to(`conversation_${targetConvId}`).emit('new_conversation_message', message);
  }

  return { message, entitlement };
}

export async function sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;
    const { conversationId, receiverId, content } = req.body;
    const io = req.app.get('io');
    const senderName = req.user.profile?.fullName || 'a match';

    const result = await sendMessageCore({
      senderId: currentUserId,
      senderName,
      conversationId,
      receiverId,
      content,
      io,
    });

    return successResponse(res, result.message, 'Message sent', 201);
  } catch (error: any) {
    if (error instanceof DailyLimitReachedError || error.code === 'DAILY_MESSAGE_LIMIT_REACHED') {
      return res.status(403).json({
        success: false,
        code: 'DAILY_MESSAGE_LIMIT_REACHED',
        message: error.message,
        data: error.data,
      });
    }
    if (error.statusCode) {
      return errorResponse(res, error.message, error.statusCode);
    }
    next(error);
  }
}

export async function getMessageUsage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;
    const usage = await getDailyUsage(currentUserId);
    return successResponse(res, usage, 'Daily message usage retrieved');
  } catch (error) {
    next(error);
  }
}

export async function getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user.id;

    // Messages sent to current user that are unread
    const count = await prisma.message.count({
      where: {
        conversation: {
          OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }]
        },
        senderId: { not: currentUserId },
        isRead: false,
      }
    });

    return successResponse(res, { unreadCount: count });
  } catch (error) {
    next(error);
  }
}
