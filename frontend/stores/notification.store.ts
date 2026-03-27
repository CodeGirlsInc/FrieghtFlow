'use client';

import { create } from 'zustand';
import type { ShipmentStatus } from '../types/shipment.types';

export interface ShipmentNotification {
  id: string;
  event: string;
  shipmentId: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  updatedAt: string;
  read: boolean;
}

interface NotificationState {
  notifications: ShipmentNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<ShipmentNotification, 'id' | 'read'>) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

const generateId = (): string => {
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => {
      const newNotification: ShipmentNotification = {
        ...notification,
        id: generateId(),
        read: false,
      };
      // Keep only the last 20 notifications
      const updatedNotifications = [newNotification, ...state.notifications].slice(0, 20);
      return {
        notifications: updatedNotifications,
        unreadCount: state.unreadCount + 1,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (!notification || notification.read) return state;
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    }),

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
