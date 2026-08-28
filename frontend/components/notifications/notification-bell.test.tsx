import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from './notification-bell';
import { useNotificationStore, ShipmentNotification } from '../../stores/notification.store';

function makeNotification(overrides: Partial<ShipmentNotification> = {}): ShipmentNotification {
  return {
    id: 'n1',
    event: 'shipment:created',
    shipmentId: 's1',
    trackingNumber: 'TRK-1',
    status: 'created',
    origin: 'NYC',
    destination: 'LA',
    updatedAt: new Date().toISOString(),
    read: false,
    ...overrides,
  };
}

const resetStore = () =>
  useNotificationStore.setState({ notifications: [], unreadCount: 0 });

describe('NotificationBell', () => {
  beforeEach(() => {
    resetStore();
  });

  it('shows no unread badge when there are no notifications', () => {
    render(<NotificationBell />);
    expect(screen.queryByText(/^\d+\+?$/)).not.toBeInTheDocument();
  });

  it('displays the unread count on the badge', () => {
    useNotificationStore.setState({
      notifications: [makeNotification()],
      unreadCount: 3,
    });
    render(<NotificationBell />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('caps the badge at "9+" for large unread counts', () => {
    useNotificationStore.setState({
      notifications: [makeNotification()],
      unreadCount: 15,
    });
    render(<NotificationBell />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('shows an empty state message when the dropdown is opened with no notifications', () => {
    render(<NotificationBell />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText('No notifications yet.')).toBeInTheDocument();
  });

  it('renders each notification in the dropdown list when opened', () => {
    useNotificationStore.setState({
      notifications: [
        makeNotification({ id: 'n1', trackingNumber: 'TRK-1' }),
        makeNotification({ id: 'n2', trackingNumber: 'TRK-2' }),
      ],
      unreadCount: 2,
    });
    render(<NotificationBell />);
    fireEvent.click(screen.getByLabelText('Notifications'));
    expect(screen.getByText(/TRK-1/)).toBeInTheDocument();
    expect(screen.getByText(/TRK-2/)).toBeInTheDocument();
  });

  it('marks all notifications as read when the dropdown is opened', () => {
    useNotificationStore.setState({
      notifications: [makeNotification({ read: false })],
      unreadCount: 1,
    });
    render(<NotificationBell />);

    fireEvent.click(screen.getByLabelText('Notifications'));

    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().notifications[0].read).toBe(true);
  });

  it('does not call markAllRead when opened with zero unread notifications', () => {
    useNotificationStore.setState({
      notifications: [makeNotification({ read: true })],
      unreadCount: 0,
    });
    const markAllReadSpy = jest.spyOn(useNotificationStore.getState(), 'markAllRead');

    render(<NotificationBell />);
    fireEvent.click(screen.getByLabelText('Notifications'));

    expect(markAllReadSpy).not.toHaveBeenCalled();
  });

  it('clears all notifications when "Clear all" is clicked', () => {
    useNotificationStore.setState({
      notifications: [makeNotification()],
      unreadCount: 1,
    });
    render(<NotificationBell />);
    fireEvent.click(screen.getByLabelText('Notifications'));

    fireEvent.click(screen.getByText('Clear all'));

    expect(useNotificationStore.getState().notifications).toHaveLength(0);
    expect(screen.getByText('No notifications yet.')).toBeInTheDocument();
  });

  it('toggles the dropdown open and closed when the bell is clicked', () => {
    render(<NotificationBell />);
    const bellButton = screen.getByLabelText('Notifications');

    fireEvent.click(bellButton);
    expect(screen.getByText('No notifications yet.')).toBeInTheDocument();

    fireEvent.click(bellButton);
    expect(screen.queryByText('No notifications yet.')).not.toBeInTheDocument();
  });
});
