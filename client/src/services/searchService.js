import api from './api';

export const searchService = {
  searchProfiles: (params) => api.get('/search/profiles', { params }),
  getRecommendedMatches: () => api.get('/search/recommended'),
  getFeaturedProfiles: () => api.get('/search/featured'),
  getRecentProfiles: () => api.get('/search/recent'),
};

