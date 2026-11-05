import api from './api';
import { ApiResponse } from '../types';

export const adminService = {
  getAnalytics: (): Promise<ApiResponse<any>> => 
    api.get('/admin/analytics'),
  getUsers: (params?: any): Promise<ApiResponse<any>> => 
    api.get('/admin/users', { params }),
  updateUserStatus: (userId: string, data: any): Promise<ApiResponse<any>> => 
    api.put(`/admin/users/${userId}/status`, data),
  toggleVerification: (profileId: string, data: any): Promise<ApiResponse<any>> => 
    api.put(`/admin/profiles/${profileId}/verification`, data),
  getReports: (): Promise<ApiResponse<any>> => 
    api.get('/admin/reports'),
  updateReportStatus: (reportId: string, status: string): Promise<ApiResponse<any>> => 
    api.put(`/admin/reports/${reportId}/status`, { status }),
  updatePlan: (planId: string, data: any): Promise<ApiResponse<any>> => 
    api.put(`/admin/plans/${planId}`, data),
  createSuccessStory: (data: any): Promise<ApiResponse<any>> => 
    api.post('/admin/success-stories', data),
  deleteSuccessStory: (id: string): Promise<ApiResponse<any>> => 
    api.delete(`/admin/success-stories/${id}`),
  createFaq: (data: any): Promise<ApiResponse<any>> => 
    api.post('/admin/faqs', data),
  deleteFaq: (id: string): Promise<ApiResponse<any>> => 
    api.delete(`/admin/faqs/${id}`),
};
