// __tests__/marketplace-bidding.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MarketplacePage from '@/app/(dashboard)/marketplace/page';

jest.mock('@/services/marketplaceService', () => ({
  fetchMarketplaceShipments: jest.fn(),
  submitBid: jest.fn(),
}));

import { fetchMarketplaceShipments, submitBid } from '@/services/marketplaceService';

describe('MarketplacePage Bidding Flow', () => {
  const mockShipments = [
    { id: 'ship-1', origin: 'Dallas, TX', destination: 'Denver, CO', baseRate: '$1,800' },
    { id: 'ship-2', origin: 'Miami, FL', destination: 'Atlanta, GA', baseRate: '$1,200' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders shipment listings and allows filtering', async () => {
    (fetchMarketplaceShipments as jest.Mock).mockResolvedValue(mockShipments);
    render(<MarketplacePage />);

    await waitFor(() => {
      expect(screen.getByText('Dallas, TX -> Denver, CO')).toBeInTheDocument();
      expect(screen.getByText('Miami, FL -> Atlanta, GA')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search shipments/i);
    fireEvent.change(searchInput, { target: { value: 'Dallas' } });

    expect(screen.getByText('Dallas, TX -> Denver, CO')).toBeInTheDocument();
    expect(screen.queryByText('Miami, FL -> Atlanta, GA')).not.toBeInTheDocument();
  });

  it('completes bid submission flow and displays success feedback', async () => {
    (fetchMarketplaceShipments as jest.Mock).mockResolvedValue(mockShipments);
    (submitBid as jest.Mock).mockResolvedValue({ success: true, bidId: 'bid-999' });

    render(<MarketplacePage />);

    await waitFor(() => {
      expect(screen.getByText('Dallas, TX -> Denver, CO')).toBeInTheDocument();
    });

    const bidButton = screen.getAllByRole('button', { name: /place bid/i })[0];
    fireEvent.click(bidButton);

    const bidInput = screen.getByLabelText(/your bid amount/i);
    fireEvent.change(bidInput, { target: { value: '1750' } });

    const confirmButton = screen.getByRole('button', { name: /confirm bid/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(submitBid).toHaveBeenCalledWith('ship-1', 1750);
      expect(screen.getByText(/bid submitted successfully/i)).toBeInTheDocument();
    });
  });
});