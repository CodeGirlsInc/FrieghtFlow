import { beforeEach, describe, expect, it } from '@jest/globals';
import { useNotificationStore } from '../notification.store';

describe('NotificationStore', () => {
  const createNotification = (index: number) => ({
    event: 'shipment.updated',
    shipmentId: `shipment-${index}`,
    trackingNumber: `TRACK-${index}`,
    status: 'In Transit',
    origin: 'Karachi',
    destination: 'Lahore',
    updatedAt: new Date(2026, 0, 1, 0, 0, index).toISOString(),
  });

  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  it('should be defined', () => {
    const store = useNotificationStore.getState();

    expect(store).toBeDefined();
    expect(store.notifications).toEqual([]);
    expect(store.unreadCount).toBe(0);
  });

  it('should maintain newest-first insertion order', () => {
    const store = useNotificationStore.getState();

    store.addNotification(createNotification(1));
    store.addNotification(createNotification(2));

    const notifications = useNotificationStore.getState().notifications;

    expect(notifications).toHaveLength(2);
    expect(notifications[0].shipmentId).toBe('shipment-2');
    expect(notifications[1].shipmentId).toBe('shipment-1');
  });

  it('should mark new notifications as unread', () => {
    useNotificationStore.getState().addNotification(createNotification(1));

    const state = useNotificationStore.getState();

    expect(state.notifications[0].read).toBe(false);
    expect(state.unreadCount).toBe(1);
  });

  it('should keep only the latest 20 notifications', () => {
    const store = useNotificationStore.getState();

    for (let i = 1; i <= 30; i++) {
      store.addNotification(createNotification(i));
    }

    const state = useNotificationStore.getState();

    expect(state.notifications).toHaveLength(20);
    expect(state.notifications[0].shipmentId).toBe('shipment-30');
    expect(state.notifications[19].shipmentId).toBe('shipment-11');
  });

  it.each([21, 30, 50])(
    'should keep unreadCount accurate after adding %i notifications',
    (count) => {
      const store = useNotificationStore.getState();

      for (let i = 1; i <= count; i++) {
        store.addNotification(createNotification(i));
      }

      const state = useNotificationStore.getState();

      expect(state.notifications).toHaveLength(20);
      expect(state.unreadCount).toBe(20);
      expect(state.unreadCount).toBe(
        state.notifications.filter((n) => !n.read).length,
      );
    },
  );

  it('should maintain an accurate unread count when older notifications are removed', () => {
    const store = useNotificationStore.getState();

    for (let i = 1; i <= 20; i++) {
      store.addNotification(createNotification(i));
    }

    store.markAllRead();

    store.addNotification(createNotification(21));

    const state = useNotificationStore.getState();

    expect(state.notifications).toHaveLength(20);
    expect(state.unreadCount).toBe(1);
    expect(state.notifications.filter((n) => !n.read)).toHaveLength(1);
  });

  it('should mark all notifications as read', () => {
    const store = useNotificationStore.getState();

    store.addNotification(createNotification(1));
    store.addNotification(createNotification(2));

    store.markAllRead();

    const state = useNotificationStore.getState();

    expect(state.unreadCount).toBe(0);
    expect(state.notifications.every((n) => n.read)).toBe(true);
  });

  it('should clear all notifications and reset unreadCount', () => {
    const store = useNotificationStore.getState();

    store.addNotification(createNotification(1));
    store.addNotification(createNotification(2));

    store.clearAll();

    const state = useNotificationStore.getState();

    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
  });
});
