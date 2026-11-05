import api from './api';
import { ApiResponse } from '../types';

export const publicService = {
  getSuccessStories: (): Promise<ApiResponse<any>> => 
    api.get('/public/success-stories'),
  getTestimonials: (): Promise<ApiResponse<any>> => 
    api.get('/public/testimonials'),
  getFaqs: (): Promise<ApiResponse<any>> => 
    api.get('/public/faqs'),
  getStats: (): Promise<ApiResponse<any>> => 
    api.get('/public/stats'),
  reportUser: (data: any): Promise<ApiResponse<any>> => 
    api.post('/safety/report', data),
  blockUser: (data: any): Promise<ApiResponse<any>> => 
    api.post('/safety/block', data),
  unblockUser: (userId: string): Promise<ApiResponse<any>> => 
    api.delete(`/safety/block/${userId}`),
  getBlockedUsers: (): Promise<ApiResponse<any>> => 
    api.get('/safety/blocked'),
};
