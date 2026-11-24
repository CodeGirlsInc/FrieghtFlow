
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

// ── localStorage persistence (#1836) ────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'ff-notification-bell:';

function storageKeyForUser(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function readPersistedNotifications(userId: string): ShipmentNotification[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(storageKeyForUser(userId));
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function writePersistedNotifications(
  userId: string | null,
  notifications: ShipmentNotification[],
): void {
  if (typeof window === 'undefined' || !userId) return;

  try {
    if (notifications.length === 0) {
      window.localStorage.removeItem(storageKeyForUser(userId));
    } else {
      window.localStorage.setItem(
        storageKeyForUser(userId),
        JSON.stringify(notifications.slice(0, 20)),
      );
    }
  } catch {
    // Storage can be unavailable (private mode); the in-memory bell still works.
  }
}

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

/** The badge mirrors the stored list, so it can never exceed the number of stored unread items (#1835). */
function deriveUnreadCount(notifications: ShipmentNotification[]): number {
  return notifications.filter((n) => !n.read).length;
}

// ── Sign-out clearing (#1834) ────────────────────────────────────────────────

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

// #1836: hydrate the bell from localStorage when the user changes (login,
// page load's fetchCurrentUser). Keys are scoped per user, so one user's
// notifications are never shown to another.
useAuthStore.subscribe((state) => {
  const userId = state.user?.id;
  if (!userId) return;

  const persisted = readPersistedNotifications(userId);

  if (persisted.length > 0) {
    useNotificationStore.setState({
      notifications: persisted,
      unreadCount: deriveUnreadCount(persisted),
    });
  }
});

export const useNotificationStore = create<NotificationState>((set, get) => {
  const userId = currentUserId();
  const initialNotifications = userId
    ? readPersistedNotifications(userId)
    : [];

  return {
    notifications: initialNotifications,
    unreadCount: deriveUnreadCount(initialNotifications),

    addNotification: (n) => {
      const notification: ShipmentNotification = {
        ...n,
        id: createNotificationId(n.shipmentId),
        read: false,
      };

      // Keep only the most recent 20 notifications.
      const notifications = [
        notification,
        ...get().notifications,
      ].slice(0, 20);

      writePersistedNotifications(currentUserId(), notifications);

      set({
        notifications,
        unreadCount: deriveUnreadCount(notifications),
      });
    },

    markAllRead: () => {
      const notifications = get().notifications.map((n) => ({
        ...n,
        read: true,
      }));

      writePersistedNotifications(currentUserId(), notifications);

      set({
        notifications,
        unreadCount: deriveUnreadCount(notifications),
      });
    },

    clearAll: () => {
      writePersistedNotifications(currentUserId(), []);
      set({ notifications: [], unreadCount: 0 });
    },
  };
});
