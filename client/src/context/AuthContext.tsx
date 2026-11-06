import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User, LoginRequest, RegisterRequest, ApiResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<ApiResponse<{ token: string; user: User }>>;
  register: (userData: RegisterRequest) => Promise<ApiResponse<{ token: string; user: User }>>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kalyanam_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kalyanam_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success && res.data) {
            setUser(res.data.user || (res.data as any));
            localStorage.setItem('kalyanam_user', JSON.stringify(res.data.user || res.data));
          }
        } catch (err) {
          console.error('Session validation error:', err);
          logout();
        }
      }
      setLoading(false);
    }
    initAuth();
  }, [token]);

  const login = async (credentials: LoginRequest) => {
    const res = await authService.login(credentials);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('kalyanam_token', res.data.token);
      localStorage.setItem('kalyanam_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (userData: RegisterRequest) => {
    const res = await authService.register(userData);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('kalyanam_token', res.data.token);
      localStorage.setItem('kalyanam_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kalyanam_token');
    localStorage.removeItem('kalyanam_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data.user || (res.data as any));
        localStorage.setItem('kalyanam_user', JSON.stringify(res.data.user || res.data));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

