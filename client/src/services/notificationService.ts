import api from './api';
import { ApiResponse } from '../types';

export const notificationService = {
  getNotifications: (): Promise<ApiResponse<any>> => 
    api.get('/notifications'),
  markAsRead: (id: string): Promise<ApiResponse<any>> => 
    api.put(`/notifications/${id}/read`),
  markAllAsRead: (): Promise<ApiResponse<any>> => 
    api.put('/notifications/read-all'),
};
