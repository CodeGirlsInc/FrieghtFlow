'use client';

import { create } from 'zustand';

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
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (n) =>
    set((state) => {
      const notification: ShipmentNotification = {
        ...n,
        id: `${n.shipmentId}-${Date.now()}`,
        read: false,
      };
      const notifications = [notification, ...state.notifications].slice(0, 50);
      return { notifications, unreadCount: state.unreadCount + 1 };
    }),

  markRead: (id) =>
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { notifications, unreadCount };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
