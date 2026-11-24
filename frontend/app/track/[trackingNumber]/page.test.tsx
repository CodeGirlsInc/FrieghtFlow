import React from 'react';
import { render, screen } from '@testing-library/react';
import TrackingPage from './page';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { ShipmentStatus, type PublicShipmentTracking } from '../../../types/shipment.types';

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

const publicTracking: PublicShipmentTracking = {
  trackingNumber: 'FF-ABC-123',
  origin: 'Lagos',
  destination: 'Accra',
  status: ShipmentStatus.IN_TRANSIT,
  pickupDate: null,
  estimatedDeliveryDate: '2026-09-10T00:00:00.000Z',
  actualDeliveryDate: null,
  updatedAt: '2026-08-05T00:00:00.000Z',
  timeline: [
    { status: ShipmentStatus.ACCEPTED, changedAt: '2026-08-02T00:00:00.000Z' },
    { status: ShipmentStatus.IN_TRANSIT, changedAt: '2026-08-05T00:00:00.000Z' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  useParams.mockReturnValue({ trackingNumber: 'FF-ABC-123' });
});

describe('Public tracking page', () => {
  it('shows a clear not-found state for an unknown tracking number', async () => {
    mockTrack.mockRejectedValue({ statusCode: 404 });

    render(<TrackingPage />);

    expect(await screen.findByText('Shipment not found')).toBeInTheDocument();
    expect(screen.getByText(/No shipment found for tracking number/i)).toBeInTheDocument();
  });

  it('renders the public timeline for anonymous visitors without requesting authenticated history', async () => {
    mockTrack.mockResolvedValue(publicTracking);

    render(<TrackingPage />);

    expect(await screen.findByText('Lagos → Accra')).toBeInTheDocument();
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getAllByText('In Transit')).toHaveLength(2);
    expect(screen.getByText('FF-ABC-123')).toBeInTheDocument();
    expect(screen.getByText(/Sep 10, 2026/)).toBeInTheDocument();
    expect(mockTrack).toHaveBeenCalledWith('FF-ABC-123');
    expect(mockGetHistory).not.toHaveBeenCalled();
  });

  it('does not expose price or party names from the public response', async () => {
    mockTrack.mockResolvedValue({
      ...publicTracking,
      price: 3500,
      currency: 'USD',
      shipper: { firstName: 'Sam', lastName: 'Shipper' },
      carrier: { firstName: 'Cara', lastName: 'Carrier' },
    });

    render(<TrackingPage />);

    await screen.findByText('Lagos → Accra');

    expect(screen.queryByText('$3,500.00')).not.toBeInTheDocument();
    expect(screen.queryByText('Sam Shipper')).not.toBeInTheDocument();
    expect(screen.queryByText('Cara Carrier')).not.toBeInTheDocument();
  });
});
