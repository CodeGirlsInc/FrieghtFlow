'use client';

import { create } from 'zustand';
import type { User, LoginPayload, RegisterPayload } from '../types/auth.types';
import * as authApi from '../lib/api/auth.api';
import { onTokenChange } from '../lib/api/client';

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

export const useAuthStore = create<AuthState>((set) => ({
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
}));

// FE-110: if the API client hard-logs-out (a failed token refresh clears
// the token via setAccessToken(null)) without the user ever calling this
// store's own logout(), the store would otherwise keep reporting a logged-in
// user until the next fetchCurrentUser() call. Syncing here keeps both in
// lockstep the moment the client-side session actually ends.
onTokenChange((token) => {
  if (token === null && useAuthStore.getState().user !== null) {
    useAuthStore.getState().setUser(null);
  }
});
