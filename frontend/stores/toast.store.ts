'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  add: (type: ToastType, message: string) => void;
  dismiss: (id: string) => void;
}

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  add: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    set((state) => {
      const toasts = [{ id, type, message }, ...state.toasts].slice(0, MAX_TOASTS);
      return { toasts };
    });

    setTimeout(() => {
      if (get().toasts.some((t) => t.id === id)) {
        get().dismiss(id);
      }
    }, AUTO_DISMISS_MS);
  },

  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
