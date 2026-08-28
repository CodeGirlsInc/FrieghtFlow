import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PriceCalculator } from './price-calculator';
import { apiClient } from '../../lib/api/client';

jest.mock('../../lib/api/client');
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockToastError = jest.fn();
jest.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args), success: jest.fn() },
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'New York' } });
  fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Los Angeles' } });
  fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '100' } });
}

describe('PriceCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requires origin, destination, and weight before submitting', () => {
    render(<PriceCalculator />);
    // fireEvent.submit dispatches the submit event directly, bypassing the
    // browser's native HTML5 `required` constraint validation (which would
    // otherwise block submission before the component's own JS-level check
    // ever runs) — this specifically tests that JS-level check.
    fireEvent.submit(screen.getByRole('button', { name: /calculate cost/i }).closest('form')!);
    expect(mockToastError).toHaveBeenCalledWith(
      'Origin, destination, and weight are required',
    );
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('displays exactly the backend-calculated breakdown, not an independently re-derived price', async () => {
    // These numbers deliberately don't correspond to any obvious client-side
    // formula (e.g. weightCharge isn't weightKg * some visible constant) —
    // if the component were re-deriving the total instead of just
    // formatting what the backend sent, this would catch it.
    mockApiClient.mockResolvedValue({
      baseRate: 42.17,
      weightCharge: 13.03,
      volumeCharge: 0,
      categoryMultiplier: 1.25,
      total: 68.999999, // backend rounding quirk — component must not "fix" this
      currency: 'USD',
    });
    render(<PriceCalculator />);
    fillRequiredFields();

    fireEvent.click(screen.getByRole('button', { name: /calculate cost/i }));

    await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
    expect(screen.getByText('$42.17')).toBeInTheDocument();
    expect(screen.getByText('$13.03')).toBeInTheDocument();
    expect(screen.getByText('×1.25')).toBeInTheDocument();
    // Intl.NumberFormat rounds to the currency's minor unit (2dp for USD) —
    // this is display rounding of the server value, not re-computation.
    expect(screen.getByText('$69.00')).toBeInTheDocument();
  });

  it('formats a zero volume charge correctly', async () => {
    mockApiClient.mockResolvedValue({
      baseRate: 10,
      weightCharge: 5,
      volumeCharge: 0,
      categoryMultiplier: 1,
      total: 15,
      currency: 'USD',
    });
    render(<PriceCalculator />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /calculate cost/i }));

    await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('formats a very large total without losing precision or breaking currency grouping', async () => {
    mockApiClient.mockResolvedValue({
      baseRate: 500_000,
      weightCharge: 250_000.5,
      volumeCharge: 100_000,
      categoryMultiplier: 1,
      total: 850_000.5,
      currency: 'USD',
    });
    render(<PriceCalculator />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /calculate cost/i }));

    await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
    expect(screen.getByText('$850,000.50')).toBeInTheDocument();
  });

  it('formats a very small (sub-cent) total by rounding to the nearest cent', async () => {
    mockApiClient.mockResolvedValue({
      baseRate: 0.004,
      weightCharge: 0,
      volumeCharge: 0,
      categoryMultiplier: 1,
      total: 0.004,
      currency: 'USD',
    });
    render(<PriceCalculator />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /calculate cost/i }));

    await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
    // Two occurrences: baseRate and total both format to $0.00
    expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0);
  });

  it('respects a non-USD currency returned by the backend', async () => {
    mockApiClient.mockResolvedValue({
      baseRate: 10,
      weightCharge: 5,
      volumeCharge: 0,
      categoryMultiplier: 1,
      total: 15,
      currency: 'EUR',
    });
    render(<PriceCalculator />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /calculate cost/i }));

    await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
    expect(screen.getByText('€15.00')).toBeInTheDocument();
  });

  it('shows an error toast and no breakdown when the calculation request fails', async () => {
    mockApiClient.mockRejectedValue(new Error('network down'));
    render(<PriceCalculator />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /calculate cost/i }));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith('Failed to calculate cost'),
    );
    expect(screen.queryByText('Price Breakdown')).not.toBeInTheDocument();
  });
});
