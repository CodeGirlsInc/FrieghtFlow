import React from 'react';
import { render, screen, act } from '@testing-library/react';
import TrackingPage from './page';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { ShipmentStatus, type Shipment } from '../../../types/shipment.types';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('../../../lib/api/shipment.api', () => ({
  shipmentApi: {
    track: jest.fn(),
    getHistory: jest.fn(),
  },
}));

const { useParams } = jest.requireMock('next/navigation') as {
  useParams: jest.Mock;
};
const mockTrack = shipmentApi.track as jest.Mock;
const mockGetHistory = shipmentApi.getHistory as jest.Mock;

const fullShipment: Shipment = {
  id: 's-1',
  trackingNumber: 'FF-ABC-123',
  shipperId: 'u-shipper',
  shipper: { id: 'u-shipper', firstName: 'Sam', lastName: 'Shipper', email: 'sam@example.com' },
  carrierId: 'u-carrier',
  carrier: { id: 'u-carrier', firstName: 'Cara', lastName: 'Carrier', email: 'cara@example.com' },
  origin: 'Lagos',
  destination: 'Accra',
  cargoDescription: 'Palletised electronics',
  weightKg: 1200,
  volumeCbm: 4,
  price: 3500,
  currency: 'USD',
  status: ShipmentStatus.IN_TRANSIT,
  notes: null,
  pickupDate: null,
  estimatedDeliveryDate: '2026-09-10T00:00:00.000Z',
  actualDeliveryDate: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-05T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  useParams.mockReturnValue({ trackingNumber: 'FF-ABC-123' });
  mockGetHistory.mockResolvedValue([]);
});

describe('Public tracking page — unknown / invalid tracking numbers', () => {
  it('shows a clear "not found" state when the API returns 404', async () => {
    mockTrack.mockRejectedValue({ statusCode: 404 });

    render(<TrackingPage />);

    expect(await screen.findByText('Shipment not found')).toBeInTheDocument();
    expect(
      screen.getByText(/No shipment found for tracking number/i),
    ).toBeInTheDocument();
  });

  it('shows the same not-found treatment for a malformed tracking number as for an unknown one, so the format cannot be enumerated', async () => {
    const bodyRe = /No shipment found for tracking number .+\./;

    // Unknown-but-well-formed number.
    mockTrack.mockRejectedValueOnce({ statusCode: 404 });
    const unknown = render(<TrackingPage />);
    expect(await unknown.findByText('Shipment not found')).toBeInTheDocument();
    expect(unknown.container.textContent).toMatch(bodyRe);
    expect(unknown.container.textContent).not.toMatch(/invalid|malformed|bad format|pattern/i);
    unknown.unmount();

    // Clearly malformed number — same 404 treatment, no "invalid format" branch.
    useParams.mockReturnValue({ trackingNumber: '!!!bogus~~~999' });
    mockTrack.mockRejectedValueOnce({ statusCode: 404 });
    const malformed = render(<TrackingPage />);
    expect(await malformed.findByText('Shipment not found')).toBeInTheDocument();
    expect(malformed.container.textContent).toMatch(bodyRe);
    expect(malformed.container.textContent).not.toMatch(/invalid|malformed|bad format|pattern/i);
  });

  it('shows a generic error (not a raw stack / blank page) for non-404 failures', async () => {
    mockTrack.mockRejectedValue({ statusCode: 500 });

    render(<TrackingPage />);

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/Unable to retrieve tracking information/i),
    ).toBeInTheDocument();
  });

  it('never renders a blank page: a loading indicator is shown while the lookup is in flight', async () => {
    let resolveTrack: (s: Shipment) => void = () => {};
    mockTrack.mockImplementation(
      () => new Promise<Shipment>((res) => { resolveTrack = res; }),
    );

    render(<TrackingPage />);

    expect(screen.getByText(/Looking up shipment/i)).toBeInTheDocument();

    await act(async () => {
      resolveTrack(fullShipment);
    });
    expect(await screen.findByText('Lagos → Accra')).toBeInTheDocument();
  });
});

describe('Public tracking page — anonymous data boundary', () => {
  it('resolves tracking data without any auth token / login redirect', async () => {
    mockTrack.mockResolvedValue(fullShipment);

    render(<TrackingPage />);

    // Route renders shipment data directly; it does not gate on auth state.
    expect(await screen.findByText('Lagos → Accra')).toBeInTheDocument();
    expect(mockTrack).toHaveBeenCalledWith('FF-ABC-123');
  });

  it('exposes only the intended public fields to an anonymous viewer', async () => {
    mockTrack.mockResolvedValue(fullShipment);

    render(<TrackingPage />);

    await screen.findByText('Lagos → Accra');

    // Deliberately public: route, status, cargo summary, weight, price, parties, ETA.
    expect(screen.getByText('FF-ABC-123')).toBeInTheDocument();
    expect(screen.getByText('Palletised electronics')).toBeInTheDocument();
    expect(screen.getByText('1,200 kg')).toBeInTheDocument();
    expect(screen.getByText('$3,500.00')).toBeInTheDocument();
    expect(screen.getByText('Sam Shipper')).toBeInTheDocument();
    expect(screen.getByText('Cara Carrier')).toBeInTheDocument();

    // Deliberately NOT surfaced: contact emails / internal notes / raw ids.
    expect(screen.queryByText('sam@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('cara@example.com')).not.toBeInTheDocument();
    expect(screen.queryByText('s-1')).not.toBeInTheDocument();
  });
});
