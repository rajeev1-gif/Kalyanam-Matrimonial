import api from './api';
import { ApiResponse } from '../types';

export const membershipService = {
  getPlans: (): Promise<ApiResponse<any>> => 
    api.get('/membership/plans'),
  getCurrentSubscription: (): Promise<ApiResponse<any>> => 
    api.get('/membership/current'),
  createOrder: (planId: string): Promise<ApiResponse<any>> => 
    api.post('/membership/orders', { planId }),
  verifyPayment: (paymentData: any): Promise<ApiResponse<any>> => 
    api.post('/membership/verify', paymentData),
  getPaymentHistory: (): Promise<ApiResponse<any>> => 
    api.get('/membership/payments'),
  getMessageUsage: (): Promise<ApiResponse<any>> =>
    api.get('/messages/usage'),
};
