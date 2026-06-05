import { render, screen } from '@testing-library/react';
import { ShipmentCard } from './shipment-card';
import { Shipment, ShipmentStatus } from '../../types/shipment.types';

jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

const STATUS_BADGE_CLASSES: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'bg-yellow-100',
  [ShipmentStatus.ACCEPTED]: 'bg-blue-100',
  [ShipmentStatus.IN_TRANSIT]: 'bg-indigo-100',
  [ShipmentStatus.DELIVERED]: 'bg-teal-100',
  [ShipmentStatus.COMPLETED]: 'bg-green-100',
  [ShipmentStatus.CANCELLED]: 'bg-gray-100',
  [ShipmentStatus.DISPUTED]: 'bg-red-100',
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  [ShipmentStatus.PENDING]: 'Pending',
  [ShipmentStatus.ACCEPTED]: 'Accepted',
  [ShipmentStatus.IN_TRANSIT]: 'In Transit',
  [ShipmentStatus.DELIVERED]: 'Delivered',
  [ShipmentStatus.COMPLETED]: 'Completed',
  [ShipmentStatus.CANCELLED]: 'Cancelled',
  [ShipmentStatus.DISPUTED]: 'Disputed',
};

function createMockShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 'shipment-123',
    trackingNumber: 'FF-ABC123',
    shipperId: 'shipper-1',
    shipper: {
      id: 'shipper-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    carrierId: null,
    carrier: null,
    origin: 'Lagos',
    destination: 'Abuja',
    cargoDescription: 'Electronics and spare parts',
    weightKg: 500,
    volumeCbm: 2.5,
    price: 1500,
    currency: 'USD',
    status: ShipmentStatus.PENDING,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: '2026-07-15T00:00:00.000Z',
    actualDeliveryDate: null,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('ShipmentCard', () => {
  it('renders tracking number, origin, destination, price, and ETA date from props', () => {
    render(<ShipmentCard shipment={createMockShipment()} />);

    expect(screen.getByText('FF-ABC123')).toBeInTheDocument();
    expect(screen.getByText('Lagos → Abuja')).toBeInTheDocument();
    expect(screen.getByText('$1,500.00')).toBeInTheDocument();
    expect(screen.getByText(/ETA:/)).toBeInTheDocument();
    expect(screen.getByText(/Jul 14, 2026|Jul 15, 2026/)).toBeInTheDocument();
    expect(screen.getByText('Electronics and spare parts')).toBeInTheDocument();
    expect(screen.getByText('500 kg')).toBeInTheDocument();
  });

  it.each([
    ShipmentStatus.PENDING,
    ShipmentStatus.ACCEPTED,
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.DELIVERED,
    ShipmentStatus.COMPLETED,
    ShipmentStatus.CANCELLED,
  ])('renders the correct status badge for %s', (status) => {
    render(<ShipmentCard shipment={createMockShipment({ status })} />);

    const badge = screen.getByText(STATUS_LABELS[status]);
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(STATUS_BADGE_CLASSES[status]);
  });

  it('links to the shipment detail page with the correct shipment ID', () => {
    render(<ShipmentCard shipment={createMockShipment({ id: 'abc-456' })} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/shipments/abc-456');
  });

  it('renders without crashing when optional cargo description is undefined', () => {
    const shipment = createMockShipment();
    // Simulate missing optional display field at runtime
    (shipment as { cargoDescription?: string }).cargoDescription = undefined;

    expect(() => render(<ShipmentCard shipment={shipment} />)).not.toThrow();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/shipments/shipment-123');
    expect(screen.getByText('FF-ABC123')).toBeInTheDocument();
  });

  it('renders without crashing when price is undefined', () => {
    const shipment = createMockShipment();
    (shipment as { price?: number }).price = undefined;

    expect(() => render(<ShipmentCard shipment={shipment} />)).not.toThrow();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/shipments/shipment-123');
    expect(screen.getByText('Lagos → Abuja')).toBeInTheDocument();
  });
});
