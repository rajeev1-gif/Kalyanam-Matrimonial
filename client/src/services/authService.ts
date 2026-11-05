import api from './api';
import { ApiResponse, LoginRequest, RegisterRequest } from '../types';

export const authService = {
  login: (credentials: LoginRequest): Promise<ApiResponse<any>> => 
    api.post('/auth/login', credentials),
  register: (userData: RegisterRequest): Promise<ApiResponse<any>> => 
    api.post('/auth/register', userData),
  getMe: (): Promise<ApiResponse<any>> => 
    api.get('/auth/me'),
  forgotPassword: (data: { email: string }): Promise<ApiResponse<any>> => 
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { token: string; password?: string; newPassword?: string }): Promise<ApiResponse<any>> => 
    api.post('/auth/reset-password', data),
  updatePassword: (data: { currentPassword?: string; newPassword?: string }): Promise<ApiResponse<any>> => 
    api.post('/auth/update-password', data),
};
