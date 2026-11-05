const jwt = require('jsonwebtoken');

function setupChatSockets(io) {
  // Store online users: userId -> Set of socket ids
  const onlineUsers = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'matrimonial_jwt_super_secret_key_2026_indian_wedding');
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    // Join personal room for notifications and direct events
    socket.join(`user_${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast user online status
    io.emit('user_status', { userId, status: 'ONLINE' });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Typing indicators
    socket.on('typing_start', ({ conversationId, receiverId }) => {
      socket.to(`conversation_${conversationId}`).emit('partner_typing', {
        conversationId,
        userId,
      });
    });

    socket.on('typing_stop', ({ conversationId, receiverId }) => {
      socket.to(`conversation_${conversationId}`).emit('partner_stopped_typing', {
        conversationId,
        userId,
      });
    });

    // Check online status query
    socket.on('check_online', (targetUserId, callback) => {
      const isOnline = onlineUsers.has(targetUserId) && onlineUsers.get(targetUserId).size > 0;
      if (typeof callback === 'function') {
        callback({ isOnline });
      }
    });

    socket.on('disconnect', () => {
      if (onlineUsers.has(userId)) {
        onlineUsers.get(userId).delete(socket.id);
        if (onlineUsers.get(userId).size === 0) {
          onlineUsers.delete(userId);
          io.emit('user_status', { userId, status: 'OFFLINE' });
        }
      }
    });
  });
}

export default setupChatSockets;

