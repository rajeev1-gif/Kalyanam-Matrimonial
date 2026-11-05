import api from './api';

export const membershipService = {
  getPlans: () => api.get('/membership/plans'),
  getCurrentSubscription: () => api.get('/membership/current'),
  createOrder: (planId) => api.post('/membership/orders', { planId }),
  verifyPayment: (paymentData) => api.post('/membership/verify', paymentData),
  getPaymentHistory: () => api.get('/membership/payments'),
};

