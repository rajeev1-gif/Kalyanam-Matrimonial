
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/env';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('kalyanam_token');

    // Prevent duplicate /api/api/ segments when baseURL already ends with /api.
    if (config.url && API_BASE_URL.endsWith('/api')) {
      config.url = config.url.replace(/^\/?api(?=\/|$)/, '') || '/';
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kalyanam_token');
      localStorage.removeItem('kalyanam_user');

      if (
        window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/admin')
      ) {
        window.location.href = '/login?expired=true';
      }
    }

    return Promise.reject(error.response?.data || error.message || error);
  }
);

export default api;
