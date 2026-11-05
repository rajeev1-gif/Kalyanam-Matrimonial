import api from './api';

export const interestService = {
  sendInterest: (data) => api.post('/interests/send', data),
  acceptInterest: (interestId) => api.put(`/interests/${interestId}/accept`),
  rejectInterest: (interestId) => api.put(`/interests/${interestId}/reject`),
  withdrawInterest: (interestId) => api.delete(`/interests/${interestId}/withdraw`),
  getReceived: () => api.get('/interests/received'),
  getSent: () => api.get('/interests/sent'),
  getConnections: () => api.get('/interests/connections'),
};

