import React from 'react';
import { render, screen } from '@testing-library/react';
import { ShipmentCard } from '../../../components/shipment/shipment-card';
import { ShipmentStatus } from '../../../types/shipment.types';
import type { Shipment } from '../../../types/shipment.types';

jest.mock('../../../components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
}));

jest.mock('../../../components/shipment/status-badge', () => ({
  StatusBadge: ({ status }: { status: ShipmentStatus }) => (
    <span data-testid="status-badge" data-status={status}>{status}</span>
  ),
}));

const baseShipment: Shipment = {
  id: 'shipment-1',
  trackingNumber: 'TRK-0001',
  shipperId: 'shipper-1',
  shipper: { id: 'shipper-1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' },
  carrierId: 'carrier-1',
  carrier: { id: 'carrier-1', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' },
  origin: 'Lagos',
  destination: 'Abuja',
  cargoDescription: 'Electronics shipment',
  weightKg: 120,
  volumeCbm: 5,
  price: 8000,
  currency: 'USD',
  status: ShipmentStatus.PENDING,
  notes: null,
  pickupDate: null,
  estimatedDeliveryDate: null,
  actualDeliveryDate: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('ShipmentCard', () => {
  describe('core content', () => {
    it('displays the tracking number', () => {
      render(<ShipmentCard shipment={baseShipment} />);
      expect(screen.getByText('TRK-0001')).toBeInTheDocument();
    });

    it('displays origin and destination', () => {
      render(<ShipmentCard shipment={baseShipment} />);
      expect(screen.getByText(/Lagos/)).toBeInTheDocument();
      expect(screen.getByText(/Abuja/)).toBeInTheDocument();
    });

    it('renders cargo description', () => {
      render(<ShipmentCard shipment={baseShipment} />);
      expect(screen.getByText('Electronics shipment')).toBeInTheDocument();
    });

    it('shows weight in kg', () => {
      render(<ShipmentCard shipment={baseShipment} />);
      expect(screen.getByText('120 kg')).toBeInTheDocument();
    });

    it('renders a link pointing to the shipment detail page', () => {
      render(<ShipmentCard shipment={baseShipment} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/shipments/shipment-1');
    });

    it('shows formatted price in USD', () => {
      render(<ShipmentCard shipment={{ ...baseShipment, price: 1200, currency: 'USD' }} />);
      expect(screen.getByText('$1,200.00')).toBeInTheDocument();
    });
  });

  describe('status badge for all ShipmentStatus values', () => {
    const allStatuses: ShipmentStatus[] = [
      ShipmentStatus.PENDING,
      ShipmentStatus.ACCEPTED,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.DELIVERED,
      ShipmentStatus.COMPLETED,
      ShipmentStatus.CANCELLED,
      ShipmentStatus.DISPUTED,
    ];

    allStatuses.forEach((status) => {
      it(`renders the ${status} status badge`, () => {
        render(<ShipmentCard shipment={{ ...baseShipment, status }} />);
        const badge = screen.getByTestId('status-badge');
        expect(badge).toHaveAttribute('data-status', status);
        expect(badge).toBeInTheDocument();
      });
    });
  });

  describe('optional fields', () => {
    it('shows volume when volumeCbm is provided', () => {
      render(<ShipmentCard shipment={{ ...baseShipment, volumeCbm: 8 }} />);
      const cardContent = screen.getByTestId('card-content');
      expect(cardContent.textContent).toMatch(/8\s*m/);
    });

    it('omits volume display when volumeCbm is null', () => {
      render(<ShipmentCard shipment={{ ...baseShipment, volumeCbm: null }} />);
      const cardContent = screen.getByTestId('card-content');
      expect(cardContent.textContent).not.toMatch(/\d+\s*m/);
    });

    it('shows ETA section when estimatedDeliveryDate is provided', () => {
      render(
        <ShipmentCard
          shipment={{ ...baseShipment, estimatedDeliveryDate: '2024-06-15T00:00:00Z' }}
        />,
      );
      expect(screen.getByText(/ETA/)).toBeInTheDocument();
    });

    it('hides ETA section when estimatedDeliveryDate is null', () => {
      render(<ShipmentCard shipment={{ ...baseShipment, estimatedDeliveryDate: null }} />);
      expect(screen.queryByText(/ETA/)).not.toBeInTheDocument();
    });

    it('falls back to USD when currency is not provided', () => {
      render(<ShipmentCard shipment={{ ...baseShipment, price: 500, currency: '' }} />);
      expect(screen.getByText('$500.00')).toBeInTheDocument();
    });
  });
});
