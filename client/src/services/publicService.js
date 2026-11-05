import api from './api';

export const publicService = {
  getSuccessStories: () => api.get('/public/success-stories'),
  getTestimonials: () => api.get('/public/testimonials'),
  getFaqs: () => api.get('/public/faqs'),
  getStats: () => api.get('/public/stats'),
  reportUser: (data) => api.post('/safety/report', data),
  blockUser: (data) => api.post('/safety/block', data),
  unblockUser: (userId) => api.delete(`/safety/block/${userId}`),
  getBlockedUsers: () => api.get('/safety/blocked'),
};

