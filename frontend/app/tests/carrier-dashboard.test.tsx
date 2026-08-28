// __tests__/carrier-dashboard.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CarrierDashboardPage from '@/app/(dashboard)/carrier/page';

// Mock the carrier data fetcher or service
jest.mock('@/services/carrierService', () => ({
  fetchCarrierDashboardData: jest.fn(),
}));

import { fetchCarrierDashboardData } from '@/services/carrierService';

describe('CarrierDashboardPage', () => {
  const mockCarrierData = {
    activeShipments: 12,
    pendingLoads: 4,
    totalEarnings: '$45,230.00',
    recentDispatches: [
      { id: 'disp-101', route: 'Chicago -> Atlanta', status: 'In Transit' },
    ],
  };

  it('renders loading state initially', () => {
    (fetchCarrierDashboardData as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<CarrierDashboardPage />);
    expect(screen.getByText(/loading carrier dashboard/i)).toBeInTheDocument();
  });

  it('renders summary data and recent dispatches on successful fetch', async () => {
    (fetchCarrierDashboardData as jest.Mock).mockResolvedValue(mockCarrierData);
    render(<CarrierDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('$45,230.00')).toBeInTheDocument();
      expect(screen.getByText('Chicago -> Atlanta')).toBeInTheDocument();
    });
  });

  it('renders error state when data fetching fails', async () => {
    (fetchCarrierDashboardData as jest.Mock).mockRejectedValue(new Error('Failed to load carrier data'));
    render(<CarrierDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load carrier dashboard/i)).toBeInTheDocument();
    });
  });
});