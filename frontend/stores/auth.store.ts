'use client';

import { create } from 'zustand';
import type { User, LoginPayload, RegisterPayload } from '../types/auth.types';
import * as authApi from '../lib/api/auth.api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === 'sessionStorage') {
        const refreshToken = sessionStorage.getItem('refreshToken');
        const userId = sessionStorage.getItem('userId');
        if (!refreshToken || !userId) {
          set({ user: null, isAuthenticated: false });
        }
      }
    });
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,

    login: async (payload) => {
      set({ isLoading: true });
      try {
        const { user } = await authApi.login(payload);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (payload) => {
      set({ isLoading: true });
      try {
        const { user } = await authApi.register(payload);
        set({ user, isAuthenticated: true, isLoading: false });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await authApi.logout();
      } finally {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    fetchCurrentUser: async () => {
      set({ isLoading: true });
      try {
        const user = await authApi.getCurrentUser();
        set({ user, isAuthenticated: true, isLoading: false });
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});
