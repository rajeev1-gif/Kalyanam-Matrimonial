import api from './api';

export const adminService = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, data) => api.put(`/admin/users/${userId}/status`, data),
  toggleVerification: (profileId, data) => api.put(`/admin/profiles/${profileId}/verification`, data),
  getReports: () => api.get('/admin/reports'),
  updateReportStatus: (reportId, status) => api.put(`/admin/reports/${reportId}/status`, { status }),
  updatePlan: (planId, data) => api.put(`/admin/plans/${planId}`, data),
  createSuccessStory: (data) => api.post('/admin/success-stories', data),
  deleteSuccessStory: (id) => api.delete(`/admin/success-stories/${id}`),
  createFaq: (data) => api.post('/admin/faqs', data),
  deleteFaq: (id) => api.delete(`/admin/faqs/${id}`),
};

