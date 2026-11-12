
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
