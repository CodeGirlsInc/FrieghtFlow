'use client';

import { create } from 'zustand';
import { useAuthStore } from './auth.store';

export interface ShipmentNotification {
  id: string;
  event: string;
  shipmentId: string;
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  updatedAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: ShipmentNotification[];
  unreadCount: number;
  addNotification: (n: Omit<ShipmentNotification, 'id' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

let fallbackNotificationId = 0;

function createNotificationId(shipmentId: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid
    ? `${shipmentId}-${uuid}`
    : `${shipmentId}-${Date.now()}-${++fallbackNotificationId}`;
}

// ── Sign-out clearing (#1834) ────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'ff-notification-bell:';

function storageKeyForUser(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

/** The last user the store saw signed in — used to clear their storage on logout. */
let lastUserId: string | null = null;

useAuthStore.subscribe((state) => {
  if (state.user) lastUserId = state.user.id;
});

useAuthStore.subscribe((state) => {
  if (state.user !== null) return;
  const { notifications, clearAll } = useNotificationStore.getState();
  if (notifications.length === 0) return;
  // The user is signing out — drop this user's persisted copy so the bell
  // cannot resurrect their notifications on the next visit.
  if (typeof window !== 'undefined' && lastUserId) {
    try {
      window.localStorage.removeItem(storageKeyForUser(lastUserId));
    } catch {
      // Storage can be unavailable; the in-memory clear still applies.
    }
  }
  clearAll();
});

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((state) => {
      const notification: ShipmentNotification = {
        ...n,
        id: createNotificationId(n.shipmentId),
        read: false,
      };
      // Keep only the most recent 20 notifications
      const notifications = [notification, ...state.notifications].slice(0, 20);
      return { notifications, unreadCount: state.unreadCount + 1 };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
