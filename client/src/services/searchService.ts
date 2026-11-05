import api from './api';
import { ApiResponse, SearchFilters } from '../types';

export const searchService = {
  searchProfiles: (params: SearchFilters | any): Promise<ApiResponse<any>> => 
    api.get('/search/profiles', { params }),
  getRecommendedMatches: (): Promise<ApiResponse<any>> => 
    api.get('/search/recommended'),
  getFeaturedProfiles: (): Promise<ApiResponse<any>> => 
    api.get('/search/featured'),
  getRecentProfiles: (): Promise<ApiResponse<any>> => 
    api.get('/search/recent'),
};
