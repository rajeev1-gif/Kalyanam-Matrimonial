import api from './api';
import { ApiResponse } from '../types';

export const chatService = {
  getConversations: (): Promise<ApiResponse<any>> => 
    api.get('/chat/conversations'),
  getMessages: (conversationId: string): Promise<ApiResponse<any>> => 
    api.get(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (data: { conversationId?: string; receiverId?: string; content: string }): Promise<ApiResponse<any>> => 
    api.post('/chat/messages', data),
  getUnreadCount: (): Promise<ApiResponse<any>> => 
    api.get('/chat/unread-count'),
};
