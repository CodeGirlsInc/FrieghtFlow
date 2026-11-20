import { useNotificationStore } from './notification.store';

describe('notification store', () => {
  beforeEach(() => {
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
  });

  it('assigns unique ids to notifications added in the same tick', () => {
    const addNotification = useNotificationStore.getState().addNotification;
    const notification = {
      event: 'shipment.updated',
      shipmentId: 'shipment-1',
      trackingNumber: 'FF-ABC-123',
      status: 'accepted',
      origin: 'Lagos',
      destination: 'Accra',
      updatedAt: '2026-08-05T00:00:00.000Z',
    };

    addNotification(notification);
    addNotification(notification);

    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(2);
    expect(notifications[0].id).not.toBe(notifications[1].id);
  });
});
