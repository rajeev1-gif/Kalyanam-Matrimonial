import api from './api';
import { ApiResponse } from '../types';

export const interestService = {
  sendInterest: (data: { receiverId: string; message?: string }): Promise<ApiResponse<any>> => 
    api.post('/interests/send', data),
  acceptInterest: (interestId: string): Promise<ApiResponse<any>> => 
    api.put(`/interests/${interestId}/accept`),
  rejectInterest: (interestId: string): Promise<ApiResponse<any>> => 
    api.put(`/interests/${interestId}/reject`),
  withdrawInterest: (interestId: string): Promise<ApiResponse<any>> => 
    api.delete(`/interests/${interestId}/withdraw`),
  getReceived: (): Promise<ApiResponse<any>> => 
    api.get('/interests/received'),
  getSent: (): Promise<ApiResponse<any>> => 
    api.get('/interests/sent'),
  getConnections: (): Promise<ApiResponse<any>> => 
    api.get('/interests/connections'),
};
