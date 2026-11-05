const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

async function getConversations(req, res, next) {
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

async function getMessages(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { conversationId } = req.params;

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

async function sendMessage(req, res, next) {
  try {
    const currentUserId = req.user.id;
    const { conversationId, receiverId, content } = req.body;

    if (!content || !content.trim()) {
      return errorResponse(res, 'Message text cannot be empty', 400);
    }

    let targetConvId = conversationId;
    let targetReceiverId = receiverId;

    if (targetConvId) {
      const conv = await prisma.conversation.findUnique({ where: { id: targetConvId } });
      if (!conv) return errorResponse(res, 'Conversation not found', 404);
      if (conv.user1Id !== currentUserId && conv.user2Id !== currentUserId) {
        return errorResponse(res, 'Unauthorized', 403);
      }
      targetReceiverId = conv.user1Id === currentUserId ? conv.user2Id : conv.user1Id;
    } else if (targetReceiverId) {
      // Find or create conversation
      const [u1, u2] = [currentUserId, targetReceiverId].sort();
      const conv = await prisma.conversation.upsert({
        where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
        create: { user1Id: u1, user2Id: u2 },
        update: {}
      });
      targetConvId = conv.id;
    } else {
      return errorResponse(res, 'Conversation ID or Receiver ID is required', 400);
    }

    // Check if blocked
    const isBlocked = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: currentUserId, blockedUserId: targetReceiverId },
          { blockerId: targetReceiverId, blockedUserId: currentUserId },
        ]
      }
    });
    if (isBlocked) {
      return errorResponse(res, 'Cannot send message to this user', 403);
    }

    // Check mutual connection or valid subscription allowing direct message
    const connection = await prisma.interest.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: targetReceiverId, status: 'ACCEPTED' },
          { senderId: targetReceiverId, receiverId: currentUserId, status: 'ACCEPTED' },
        ]
      }
    });

    const userSub = req.user.subscriptions?.[0];
    const canDirectMessage = userSub?.plan?.canDirectMessage || false;

    if (!connection && !canDirectMessage) {
      return errorResponse(res, 'Direct messaging requires an accepted connection or a premium membership.', 403);
    }

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.message.create({
        data: {
          conversationId: targetConvId,
          senderId: currentUserId,
          content: content.trim(),
        }
      });

      await tx.conversation.update({
        where: { id: targetConvId },
        data: { lastMessageAt: new Date() }
      });

      await tx.notification.create({
        data: {
          userId: targetReceiverId,
          type: 'NEW_MESSAGE',
          title: `New Message from ${req.user.profile?.fullName || 'a match'}`,
          message: content.trim().length > 60 ? content.trim().substring(0, 57) + '...' : content.trim(),
          link: '/dashboard/messages',
        }
      });

      return msg;
    });

    // Emit via Socket.IO if io instance is on app
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${targetReceiverId}`).emit('receive_message', {
        ...message,
        senderName: req.user.profile?.fullName,
      });
      io.to(`conversation_${targetConvId}`).emit('new_conversation_message', message);
    }

    return successResponse(res, message, 'Message sent', 201);
  } catch (error) {
    next(error);
  }
}

async function getUnreadCount(req, res, next) {
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

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
};

