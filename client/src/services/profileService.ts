import api from './api';
import { ApiResponse, Profile } from '../types';

export const profileService = {
  getMyProfile: (): Promise<ApiResponse<any>> => 
    api.get('/profiles/me'),
  updateProfile: (profileData: Partial<Profile> | any): Promise<ApiResponse<any>> => 
    api.put('/profiles/me', profileData),
  uploadPhoto: (formData: FormData | any): Promise<ApiResponse<any>> => 
    api.post('/profiles/photos', formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    }),
  deletePhoto: (photoId: string): Promise<ApiResponse<any>> => 
    api.delete(`/profiles/photos/${photoId}`),
  setPrimaryPhoto: (photoId: string): Promise<ApiResponse<any>> => 
    api.put(`/profiles/photos/${photoId}/primary`),
  getPublicProfile: (userId: string): Promise<ApiResponse<any>> => 
    api.get(`/profiles/user/${userId}`),
};
