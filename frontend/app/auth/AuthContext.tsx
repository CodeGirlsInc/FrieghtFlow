'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Prevent multiple refreshes
  const { token, refreshToken, login, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    setIsLoading(false); // Zustand loads tokens automatically
  }, []);

  const loginHandler = (token: string, newRefreshToken: string) => {
    login(null, token, newRefreshToken);
  };

  const logoutHandler = () => {
    logout();
  };

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded: { exp: number } = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true; // Assume expired if decoding fails
    }
  };

  const refreshTokenHandler = async () => {
    if (!refreshToken || isRefreshing) {
      logout();
      return;
    }

    setIsRefreshing(true);
    setIsLoading(true);
    try {
      const response = await fetch('/api/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Refresh token failed');
      }

      const data = await response.json();
      login(null, data.accessToken, data.refreshToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  // Auto-refresh token if expired on mount
  useEffect(() => {
    if (token && isTokenExpired(token) && !isRefreshing) {
      refreshTokenHandler();
    }
  }, [token, refreshToken, isRefreshing]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login: loginHandler,
        logout: logoutHandler,
        refreshToken: refreshTokenHandler,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};