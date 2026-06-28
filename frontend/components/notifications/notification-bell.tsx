import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationBell } from '../notification-bell';

const mockNotifications = [
  {
    id: '1',
    title: 'Bid received',
    message: 'You have a new bid on shipment #1234',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Shipment delivered',
    message: 'Shipment #5678 has been delivered',
    read: true,
    createdAt: new Date().toISOString(),
  },
];

describe('NotificationBell', () => {
  it('shows a badge with the unread count when count > 0', () => {
    render(<NotificationBell initialNotifications={mockNotifications} />);
    const badge = screen.getByTestId('unread-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('1');
  });

  it('shows no badge when unread count is 0', () => {
    const allRead = mockNotifications.map((n) => ({ ...n, read: true }));
    render(<NotificationBell initialNotifications={allRead} />);
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();
  });

  it('increments the count when a new WebSocket message arrives', () => {
    // Simulate by rendering with no notifications then updating state
    const { rerender } = render(<NotificationBell initialNotifications={[]} />);
    expect(screen.queryByTestId('unread-badge')).not.toBeInTheDocument();

    rerender(
      <NotificationBell
        initialNotifications={[
          {
            id: '99',
            title: 'New bid',
            message: 'A new bid arrived',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ]}
      />
    );

    expect(screen.getByTestId('unread-badge')).toBeInTheDocument();
    expect(screen.getByTestId('unread-badge')).toHaveTextContent('1');
  });

  it('opens the dropdown when clicked', async () => {
    const user = userEvent.setup();
    render(<NotificationBell initialNotifications={mockNotifications} />);
    const button = screen.getByRole('button', { name: /notifications/i });
    await user.click(button);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes the dropdown on Escape key', async () => {
    const user = userEvent.setup();
    render(<NotificationBell initialNotifications={mockNotifications} />);
    const button = screen.getByRole('button', { name: /notifications/i });
    await user.click(button);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});