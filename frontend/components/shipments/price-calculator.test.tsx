import React from 'react';
import { render, screen } from '@testing-library/react';
import { PriceCalculator } from './price-calculator';
import { apiClient } from '../../lib/api/client';

jest.mock('../../lib/api/client');
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

describe('PriceCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('explains that quotes are unavailable instead of presenting a broken calculator', () => {
    render(<PriceCalculator />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Price estimates are temporarily unavailable while the quote service is being built.',
    );
    expect(screen.queryByRole('button', { name: /calculate cost/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Origin')).not.toBeInTheDocument();
    expect(mockApiClient).not.toHaveBeenCalled();
  });
});
