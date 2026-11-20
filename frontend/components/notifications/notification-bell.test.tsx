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

/** The dropdown panel — the only element carrying the right-0/top-10 anchor. */
function getPanel(container: HTMLElement): HTMLElement {
  const panel = container.querySelector<HTMLElement>('.absolute.right-0.top-10');
  if (!panel) throw new Error('dropdown panel not found');
  return panel;
}

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

  describe('narrow-viewport width handling', () => {
    it('keeps the 320px look on wide screens', () => {
      const { container } = render(<NotificationBell />);
      fireEvent.click(screen.getByLabelText('Notifications'));

      expect(getPanel(container).className).toContain('w-80');
    });

    it('clamps the panel to the available viewport width', () => {
      const { container } = render(<NotificationBell />);
      fireEvent.click(screen.getByLabelText('Notifications'));

      const panel = getPanel(container);
      expect(panel.className).toContain('max-w-[calc(100vw-4rem)]');
    });

    it('fits within a 320px viewport, allowing for the header padding and the bell inset', () => {
      // In (dashboard)/layout.tsx the mobile top bar is `px-4` (1rem) with a
      // `gap-2` (0.5rem) group holding the bell then a `p-1.5` (0.375rem)
      // hamburger — so the bell's right edge is 2.5rem in from the viewport's
      // right edge. With `right-0` the panel shares that edge, so a clamp of
      // `100vw - 4rem` leaves that 2.5rem inset plus a 1.5rem gutter on the
      // left and never pushes the panel off-screen.
      //
      // jsdom has no layout engine, so the viewport width can't change a
      // computed value; the clamp's arithmetic is asserted against the literal
      // calc() in the className instead.
      const BELL_RIGHT_INSET_REM = 2.5;
      const VIEWPORT_PX = 320;

      const { container } = render(<NotificationBell />);
      fireEvent.click(screen.getByLabelText('Notifications'));

      const [, vw, rem] =
        /max-w-\[calc\((\d+)vw-(\d+)rem\)\]/.exec(getPanel(container).className)!;
      const clampedPx = (Number(vw) / 100) * VIEWPORT_PX - Number(rem) * 16;

      // Narrower than the fixed 320px…
      expect(clampedPx).toBeLessThan(320);
      // …and it must fit between the bell's right edge and the viewport's left edge.
      expect(clampedPx).toBeLessThanOrEqual(VIEWPORT_PX - BELL_RIGHT_INSET_REM * 16);
    });

    it('pins the panel to the bell with right-0, which is what makes the clamp sufficient', () => {
      const { container } = render(<NotificationBell />);
      fireEvent.click(screen.getByLabelText('Notifications'));

      const classes = getPanel(container).className;
      expect(classes).toContain('right-0');
      expect(classes).toMatch(/max-w-\[calc\(100vw-/);
    });
  });

  describe('long content does not overflow', () => {
    it('keeps a very long tracking number and route from forcing width', () => {
      useNotificationStore.setState({
        notifications: [
          makeNotification({
            trackingNumber: 'TRK-2026-0000000000000000000000000000000000000000000000',
            origin: 'Port of Long Beach, California, United States of America',
            destination: 'Rotterdam Maasvlakte, Netherlands',
          }),
        ],
        unreadCount: 0,
      });

      const { container } = render(<NotificationBell />);
      fireEvent.click(screen.getByLabelText('Notifications'));

      // The overflowing line is the truncatable one, inside a min-w-0 flex child.
      const line = screen.getByText(/TRK-2026-0000/);
      expect(line.className).toContain('truncate');
      expect(getPanel(container).querySelector('.min-w-0')).not.toBeNull();
    });

    it('lets the event label wrap rather than widen the panel', () => {
      useNotificationStore.setState({
        notifications: [makeNotification({ event: 'shipment:dispute_resolved' })],
        unreadCount: 0,
      });

      const { container } = render(<NotificationBell />);
      fireEvent.click(screen.getByLabelText('Notifications'));

      expect(screen.getByText('Dispute Resolved').className).toContain('break-words');
      expect(getPanel(container).className).toContain('overflow-hidden');
    });

    it('keeps the panel header on one line when "Clear all" is present', () => {
      useNotificationStore.setState({
        notifications: [makeNotification()],
        unreadCount: 1,
      });

      render(<NotificationBell />);
      fireEvent.click(screen.getByLabelText('Notifications'));

      const heading = screen.getByText('Notifications');
      expect(heading.className).toContain('truncate');
      expect(heading.className).toContain('min-w-0');
    });
  });
});
