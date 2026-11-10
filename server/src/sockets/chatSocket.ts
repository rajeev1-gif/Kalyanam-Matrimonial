import jwt from 'jsonwebtoken';
import { sendMessageCore } from '../controllers/chatController';
import prisma from '../config/db';

export function setupChatSockets(io: any) {
  // Store online users: userId -> Set of socket ids
  const onlineUsers = new Map<string, Set<string>>();

  io.use(async (socket: any, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'matrimonial_jwt_super_secret_key_2026_indian_wedding'
      );
      socket.userId = decoded.userId;

      // Optional: fetch user's full name for message notifications
      try {
        const u = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { profile: { select: { fullName: true } } },
        });
        socket.userFullName = u?.profile?.fullName || 'A match';
      } catch {
        socket.userFullName = 'A match';
      }

      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: any) => {
    const userId = socket.userId;
    // Join personal room for notifications and direct events
    socket.join(`user_${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Broadcast user online status
    io.emit('user_status', { userId, status: 'ONLINE' });

    // Join conversation room
    socket.on('join_conversation', (conversationId: string) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId: string) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation_${conversationId}`).emit('partner_typing', {
        conversationId,
        userId,
      });
    });

    socket.on('typing_stop', ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation_${conversationId}`).emit('partner_stopped_typing', {
        conversationId,
        userId,
      });
    });

    // Check online status query
    socket.on('check_online', (targetUserId: string, callback: Function) => {
      const isOnline = onlineUsers.has(targetUserId) && (onlineUsers.get(targetUserId)?.size || 0) > 0;
      if (typeof callback === 'function') {
        callback({ isOnline });
      }
    });

    // Socket message-sending path with identical atomic quota and entitlement enforcement
    socket.on('send_message', async (data: any, callback?: Function) => {
      try {
        const { conversationId, receiverId, content } = data || {};
        const result = await sendMessageCore({
          senderId: userId,
          senderName: socket.userFullName,
          conversationId,
          receiverId,
          content,
          io,
        });

        if (typeof callback === 'function') {
          callback({ success: true, data: result.message });
        }
      } catch (err: any) {
        const errorPayload = {
          success: false,
          code: err.code || 'MESSAGE_SEND_FAILED',
          message: err.message || 'Failed to send message',
          data: err.data || null,
        };

        socket.emit('message_error', errorPayload);
        if (typeof callback === 'function') {
          callback(errorPayload);
        }
      }
    });

    socket.on('disconnect', () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId)!.delete(socket.id);
        if (onlineUsers.get(userId)!.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_status', { userId, status: 'OFFLINE' });
        }
      }
    });
  });
}

export default setupChatSockets;
