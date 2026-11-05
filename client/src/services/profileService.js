import api from './api';

export const profileService = {
  getMyProfile: () => api.get('/profiles/me'),
  updateProfile: (profileData) => api.put('/profiles/me', profileData),
  uploadPhoto: (formData) => api.post('/profiles/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deletePhoto: (photoId) => api.delete(`/profiles/photos/${photoId}`),
  setPrimaryPhoto: (photoId) => api.put(`/profiles/photos/${photoId}/primary`),
  getPublicProfile: (userId) => api.get(`/profiles/user/${userId}`),
};

