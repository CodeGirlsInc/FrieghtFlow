import { act, renderHook } from '@testing-library/react';
import { toast } from 'sonner';
import { useShipmentSocket } from './useShipmentSocket';
import { useAuthStore } from '../stores/auth.store';
import { useNotificationStore } from '../stores/notification.store';
import { connectSocket } from '../lib/socket';

jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('../stores/auth.store', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../stores/notification.store', () => ({
  useNotificationStore: jest.fn(),
}));

jest.mock('../lib/api/client', () => ({
  getAccessToken: () => 'token',
  onTokenChange: () => () => {},
}));

jest.mock('../lib/socket', () => ({
  connectSocket: jest.fn(),
  disconnectSocket: jest.fn(),
}));

const mockAddNotification = jest.fn();
let socketHandlers: Record<string, (payload: unknown) => void> = {};

beforeEach(() => {
  jest.clearAllMocks();
  (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: { id: 'user-1' } });
  (useNotificationStore as unknown as jest.Mock).mockReturnValue({
    addNotification: mockAddNotification,
  });
  socketHandlers = {};
  (connectSocket as jest.Mock).mockReturnValue({
    on: jest.fn((event: string, handler: (payload: unknown) => void) => {
      socketHandlers[event] = handler;
    }),
    off: jest.fn(),
  });
});

function triggerShipmentUpdated(payload: Record<string, unknown>) {
  act(() => {
    socketHandlers['shipment:updated']?.(payload);
  });
}

const basePayload = {
  event: 'shipment:accepted',
  shipmentId: 'shipment-1',
  trackingNumber: 'FF-001',
  status: 'accepted',
  origin: 'Lagos',
  destination: 'Abuja',
  updatedAt: new Date().toISOString(),
};

describe('useShipmentSocket', () => {
  it('does not toast or add a bell entry for the actor\'s own action', () => {
    renderHook(() => useShipmentSocket());
    triggerShipmentUpdated({ ...basePayload, actorId: 'user-1' });

    expect(toast.info).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.warning).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('still notifies the other party about an action they did not do', () => {
    renderHook(() => useShipmentSocket());
    triggerShipmentUpdated({ ...basePayload, actorId: 'user-2' });

    expect(toast.info).toHaveBeenCalledTimes(1);
    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'shipment:accepted',
        shipmentId: 'shipment-1',
      }),
    );
  });

  it('notifies when the payload has no actor id', () => {
    renderHook(() => useShipmentSocket());
    triggerShipmentUpdated({ ...basePayload });

    expect(mockAddNotification).toHaveBeenCalledTimes(1);
  });
});
