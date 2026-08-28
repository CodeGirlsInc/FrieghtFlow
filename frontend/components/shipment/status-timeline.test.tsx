import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusTimeline } from './status-timeline';
import { ShipmentStatus, ShipmentStatusHistory } from '../../types/shipment.types';

const mockUser = {
  id: 'u1',
  firstName: 'John',
  lastName: 'Doe',
};

describe('StatusTimeline Component', () => {
  it('renders empty message when history is empty', () => {
    render(<StatusTimeline history={[]} />);
    expect(screen.getByText('No history yet.')).toBeInTheDocument();
  });

  it('renders linear happy path states correctly', () => {
    const history: ShipmentStatusHistory[] = [
      {
        id: 'h1',
        shipmentId: 's1',
        fromStatus: null,
        toStatus: ShipmentStatus.PENDING,
        changedById: 'u1',
        changedBy: mockUser,
        reason: null,
        changedAt: '2026-08-01T12:00:00.000Z',
      },
      {
        id: 'h2',
        shipmentId: 's1',
        fromStatus: ShipmentStatus.PENDING,
        toStatus: ShipmentStatus.ACCEPTED,
        changedById: 'u1',
        changedBy: mockUser,
        reason: 'Accepted by carrier',
        changedAt: '2026-08-01T13:00:00.000Z',
      },
      {
        id: 'h3',
        shipmentId: 's1',
        fromStatus: ShipmentStatus.ACCEPTED,
        toStatus: ShipmentStatus.IN_TRANSIT,
        changedById: 'u1',
        changedBy: mockUser,
        reason: null,
        changedAt: '2026-08-01T14:00:00.000Z',
      },
      {
        id: 'h4',
        shipmentId: 's1',
        fromStatus: ShipmentStatus.IN_TRANSIT,
        toStatus: ShipmentStatus.DELIVERED,
        changedById: 'u1',
        changedBy: mockUser,
        reason: null,
        changedAt: '2026-08-01T15:00:00.000Z',
      },
      {
        id: 'h5',
        shipmentId: 's1',
        fromStatus: ShipmentStatus.DELIVERED,
        toStatus: ShipmentStatus.COMPLETED,
        changedById: 'u1',
        changedBy: mockUser,
        reason: 'All checks passed',
        changedAt: '2026-08-01T16:00:00.000Z',
      },
    ];

    const { container } = render(<StatusTimeline history={history} />);

    // Verify all status labels are rendered correctly (formatted via StatusLabel)
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByText('In Transit')).toBeInTheDocument();
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    // Verify change reasons are rendered
    expect(screen.getByText('“Accepted by carrier”')).toBeInTheDocument();
    expect(screen.getByText('“All checks passed”')).toBeInTheDocument();

    // Verify "by John Doe" exists
    const authorElements = screen.getAllByText(/by John Doe/i);
    expect(authorElements.length).toBe(5);

    // Verify icon styles for happy path states
    const pendingDot = container.querySelector('.bg-yellow-400');
    const acceptedDot = container.querySelector('.bg-blue-400');
    const inTransitDot = container.querySelector('.bg-indigo-400');
    const deliveredDot = container.querySelector('.bg-teal-400');
    const completedDot = container.querySelector('.bg-green-500');

    expect(pendingDot).toBeInTheDocument();
    expect(pendingDot?.textContent).toBe('○');

    expect(acceptedDot).toBeInTheDocument();
    expect(acceptedDot?.textContent).toBe('✓');

    expect(inTransitDot).toBeInTheDocument();
    expect(inTransitDot?.textContent).toBe('→');

    expect(deliveredDot).toBeInTheDocument();
    expect(deliveredDot?.textContent).toBe('↓');

    expect(completedDot).toBeInTheDocument();
    expect(completedDot?.textContent).toBe('★');
  });

  it('renders branch states (Disputed and Cancelled) correctly', () => {
    const history: ShipmentStatusHistory[] = [
      {
        id: 'h1',
        shipmentId: 's1',
        fromStatus: ShipmentStatus.IN_TRANSIT,
        toStatus: ShipmentStatus.DISPUTED,
        changedById: 'u1',
        changedBy: mockUser,
        reason: 'Package damaged',
        changedAt: '2026-08-01T12:00:00.000Z',
      },
      {
        id: 'h2',
        shipmentId: 's1',
        fromStatus: ShipmentStatus.DISPUTED,
        toStatus: ShipmentStatus.CANCELLED,
        changedById: 'u1',
        changedBy: mockUser,
        reason: 'Dispute unresolved, order cancelled',
        changedAt: '2026-08-01T13:00:00.000Z',
      },
    ];

    const { container } = render(<StatusTimeline history={history} />);

    // Verify labels are formatted and shown
    expect(screen.getByText('Disputed')).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();

    // Verify reasons
    expect(screen.getByText('“Package damaged”')).toBeInTheDocument();
    expect(screen.getByText('“Dispute unresolved, order cancelled”')).toBeInTheDocument();

    // Verify branch icon styles (colors & icons)
    const disputedDot = container.querySelector('.bg-red-500');
    const cancelledDot = container.querySelector('.bg-gray-400');

    expect(disputedDot).toBeInTheDocument();
    expect(disputedDot?.textContent).toBe('!');

    expect(cancelledDot).toBeInTheDocument();
    expect(cancelledDot?.textContent).toBe('✕');
  });
});
