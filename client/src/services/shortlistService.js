import api from './api';

export const shortlistService = {
  toggleShortlist: (targetUserId) => api.post('/shortlists/toggle', { targetUserId }),
  getMyShortlists: () => api.get('/shortlists'),
  getProfileViews: (type = 'who_viewed_me') => api.get('/shortlists/profile-views', { params: { type } }),
};

