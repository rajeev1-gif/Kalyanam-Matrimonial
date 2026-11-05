import api from './api';
import { ApiResponse } from '../types';

export const shortlistService = {
  toggleShortlist: (targetUserId: string): Promise<ApiResponse<any>> => 
    api.post('/shortlists/toggle', { targetUserId }),
  getMyShortlists: (): Promise<ApiResponse<any>> => 
    api.get('/shortlists'),
  getProfileViews: (type: string = 'who_viewed_me'): Promise<ApiResponse<any>> => 
    api.get('/shortlists/profile-views', { params: { type } }),
};
