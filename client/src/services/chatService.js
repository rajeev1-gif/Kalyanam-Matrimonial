import api from './api';

export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (data) => api.post('/chat/messages', data),
  getUnreadCount: () => api.get('/chat/unread-count'),
};

