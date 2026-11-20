import { useNotificationStore } from './notification.store';
import { useAuthStore } from './auth.store';
import type { User } from '../types/auth.types';

function makeUser(id: string): User {
  return {
    id,
    email: `${id}@example.com`,
    firstName: 'A',
    lastName: 'B',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    walletAddress: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function sampleNotification(trackingNumber: string) {
  return {
    event: 'shipment:created',
    shipmentId: `shipment-${trackingNumber}`,
    trackingNumber,
    status: 'created',
    origin: 'NYC',
    destination: 'LA',
    updatedAt: '2026-08-05T00:00:00.000Z',
  };
}

describe('notification store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });

  it('assigns unique ids to notifications added in the same tick', () => {
    const addNotification = useNotificationStore.getState().addNotification;
    const notification = sampleNotification('FF-ABC-123');

    addNotification(notification);
    addNotification(notification);

    const { notifications } = useNotificationStore.getState();
    expect(notifications).toHaveLength(2);
    expect(notifications[0].id).not.toBe(notifications[1].id);
  });

  it('clears the bell when the user signs out (#1834)', () => {
    useAuthStore.setState({ user: makeUser('user-1'), isAuthenticated: true });
    useNotificationStore.getState().addNotification(sampleNotification('TRK-1'));
    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    // logout() and the client's hard-logout both flip the user to null.
    useAuthStore.setState({ user: null, isAuthenticated: false });

    expect(useNotificationStore.getState().notifications).toHaveLength(0);
    expect(window.localStorage.getItem('ff-notification-bell:user-1')).toBeNull();
  });
});
