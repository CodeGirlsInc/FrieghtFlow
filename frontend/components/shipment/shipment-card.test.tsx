import React from 'react';
import { render, screen } from '@testing-library/react';
import { ShipmentCard } from './shipment-card';
import { ShipmentStatus, type Shipment } from '../../types/shipment.types';

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 's-1',
    trackingNumber: 'FF-ABC-123',
    shipperId: 'u-shipper',
    shipper: { id: 'u-shipper', firstName: 'Sam', lastName: 'Shipper', email: 'sam@example.com' },
    carrierId: null,
    carrier: null,
    origin: 'Lagos',
    destination: 'Accra',
    cargoDescription: 'Palletised electronics',
    weightKg: 1200,
    volumeCbm: 4,
    price: 3500,
    currency: 'USD',
    status: ShipmentStatus.PENDING,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-05T00:00:00.000Z',
    ...overrides,
  } as Shipment;
}

describe('ShipmentCard — price formatting (FE-192)', () => {
  it('renders a valid currency exactly as before', () => {
    render(<ShipmentCard shipment={makeShipment()} />);

    expect(screen.getByText('$3,500.00')).toBeInTheDocument();
  });

  it('renders a decimal-string price, since Postgres decimal arrives as a string', () => {
    render(<ShipmentCard shipment={makeShipment({ price: '1234.5' as unknown as number })} />);

    expect(screen.getByText('$1,234.50')).toBeInTheDocument();
  });

  it('does not crash on a currency code Intl rejects', () => {
    expect(() => render(<ShipmentCard shipment={makeShipment({ currency: '123' })} />)).not.toThrow();
    expect(screen.getByText('123 3,500.00')).toBeInTheDocument();
  });

  it('falls back to USD when no currency is recorded', () => {
    render(<ShipmentCard shipment={makeShipment({ currency: '' })} />);

    expect(screen.getByText('$3,500.00')).toBeInTheDocument();
  });
});
