import React from 'react';
import { render, screen } from '@testing-library/react';
import { ShipmentCardGrid } from './shipment-card-grid';
import type { Shipment } from '../../types/shipment.types';

jest.mock('./shipment-card', () => ({
  ShipmentCard: ({ shipment }: { shipment: Shipment }) => (
    <div data-testid="shipment-card">{shipment.trackingNumber}</div>
  ),
}));

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return { id: 's1', trackingNumber: 'TRK-001', ...overrides } as Shipment;
}

describe('ShipmentCardGrid', () => {
  it('applies the shared responsive breakpoints so every shipment list matches', () => {
    render(
      <ShipmentCardGrid
        shipments={[makeShipment()]}
        label="Available shipments"
      />,
    );

    const list = screen.getByRole('list', { name: 'Available shipments' });
    expect(list).toHaveClass('grid', 'gap-4', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('marks up the shipments as a labelled list, one item per card', () => {
    const shipments = [
      makeShipment({ id: 's1', trackingNumber: 'TRK-001' }),
      makeShipment({ id: 's2', trackingNumber: 'TRK-002' }),
    ];
    const { container } = render(
      <ShipmentCardGrid shipments={shipments} label="My Shipments" />,
    );

    const list = screen.getByRole('list', { name: 'My Shipments' });
    expect(list.tagName).toBe('UL');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getAllByTestId('shipment-card').map((c) => c.textContent)).toEqual([
      'TRK-001',
      'TRK-002',
    ]);
  });

  it('lets a caller add classes without losing the shared breakpoints', () => {
    render(
      <ShipmentCardGrid shipments={[makeShipment()]} label="Shipments" className="mt-4" />,
    );

    const list = screen.getByRole('list', { name: 'Shipments' });
    expect(list).toHaveClass('mt-4');
    expect(list).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
  });
});
