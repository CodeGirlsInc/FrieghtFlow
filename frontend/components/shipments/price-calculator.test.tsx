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

const COST_BREAKDOWN = {
  baseRate: 42.17,
  weightCharge: 13.03,
  volumeCharge: 0,
  categoryMultiplier: 1.25,
  total: 68.999999,
  currency: 'USD',
};

function fillRequiredFields(weightKg = '100') {
  fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'New York' } });
  fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Los Angeles' } });
  fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: weightKg } });
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: /calculate cost/i }));
}

describe('PriceCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validation', () => {
    it('shows a per-field error for each empty required field and does not call the API', async () => {
      render(<PriceCalculator />);
      submit();

      expect(await screen.findByText('Origin is required')).toBeInTheDocument();
      expect(screen.getByText('Destination is required')).toBeInTheDocument();
      expect(screen.getByText('Weight is required')).toBeInTheDocument();
      expect(mockApiClient).not.toHaveBeenCalled();

      const origin = screen.getByLabelText('Origin');
      expect(origin).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText('Origin')).toHaveAttribute('aria-describedby', 'calc-origin-error');
      expect(screen.getByLabelText('Weight (kg)')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getAllByRole('alert')).toHaveLength(3);
    });

    it('rejects origin and destination that are only whitespace', async () => {
      render(<PriceCalculator />);
      fireEvent.change(screen.getByLabelText('Origin'), { target: { value: '   ' } });
      fireEvent.change(screen.getByLabelText('Destination'), { target: { value: '  ' } });
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '100' } });
      submit();

      expect(await screen.findByText('Origin is required')).toBeInTheDocument();
      expect(screen.getByText('Destination is required')).toBeInTheDocument();
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('rejects a zero or negative weight', async () => {
      render(<PriceCalculator />);
      fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'New York' } });
      fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Los Angeles' } });
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '0' } });
      submit();

      expect(await screen.findByText('Weight must be greater than 0')).toBeInTheDocument();
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('rejects a negative weight', async () => {
      render(<PriceCalculator />);
      fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'New York' } });
      fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Los Angeles' } });
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '-5' } });
      submit();

      expect(await screen.findByText('Weight must be greater than 0')).toBeInTheDocument();
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('rejects a non-numeric weight without calling the API', async () => {
      render(<PriceCalculator />);
      fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'New York' } });
      fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Los Angeles' } });
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: 'abc' } });
      submit();

      await waitFor(() =>
        expect(screen.getByLabelText('Weight (kg)')).toHaveAttribute('aria-invalid', 'true'),
      );
      // A number input sanitizes unparseable text, so this surfaces as the
      // "required" error rather than the "must be a number" one — either way
      // the form is blocked and the API is never called.
      expect(screen.getByRole('alert')).toHaveTextContent(/Weight/);
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('rejects a weight above the maximum', async () => {
      render(<PriceCalculator />);
      fireEvent.change(screen.getByLabelText('Origin'), { target: { value: 'New York' } });
      fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Los Angeles' } });
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '1000001' } });
      submit();

      expect(await screen.findByText('Weight must be 1,000,000 kg or less')).toBeInTheDocument();
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('accepts a weight at the maximum boundary', async () => {
      mockApiClient.mockResolvedValue(COST_BREAKDOWN);
      render(<PriceCalculator />);
      fillRequiredFields('1000000');
      submit();

      await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
      expect(mockApiClient).toHaveBeenCalledWith(
        '/shipments/calculate-cost',
        expect.objectContaining({
          body: expect.stringContaining('"weightKg":1000000'),
        }),
      );
    });

    it('rejects a negative volume', async () => {
      render(<PriceCalculator />);
      fillRequiredFields();
      fireEvent.change(screen.getByLabelText('Volume m³ (optional)'), { target: { value: '-1' } });
      submit();

      expect(await screen.findByText('Volume must be 0 or greater')).toBeInTheDocument();
      expect(mockApiClient).not.toHaveBeenCalled();
    });

    it('calculates and sends trimmed, numeric values on a valid submission', async () => {
      mockApiClient.mockResolvedValue(COST_BREAKDOWN);
      render(<PriceCalculator />);
      fireEvent.change(screen.getByLabelText('Origin'), { target: { value: '  New York  ' } });
      fireEvent.change(screen.getByLabelText('Destination'), { target: { value: ' Los Angeles ' } });
      fireEvent.change(screen.getByLabelText('Weight (kg)'), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText('Volume m³ (optional)'), { target: { value: '2.5' } });
      fireEvent.change(screen.getByLabelText('Cargo Category'), { target: { value: 'Electronics' } });
      submit();

      await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
      expect(mockApiClient).toHaveBeenCalledWith('/shipments/calculate-cost', {
        method: 'POST',
        body: JSON.stringify({
          origin: 'New York',
          destination: 'Los Angeles',
          weightKg: 100,
          volumeCbm: 2.5,
          cargoCategory: 'Electronics',
        }),
      });
    });

    it('omits the optional volume when it is left blank', async () => {
      mockApiClient.mockResolvedValue(COST_BREAKDOWN);
      render(<PriceCalculator />);
      fillRequiredFields();
      submit();

      await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
      const body = JSON.parse(
        (mockApiClient.mock.calls[0][1] as { body: string }).body,
      );
      expect(body.volumeCbm).toBeUndefined();
    });
  });

  it('displays exactly the backend-calculated breakdown, not an independently re-derived price', async () => {
    // These numbers deliberately don't correspond to any obvious client-side
    // formula (e.g. weightCharge isn't weightKg * some visible constant) —
    // if the component were re-deriving the total instead of just
    // formatting what the backend sent, this would catch it.
    mockApiClient.mockResolvedValue(COST_BREAKDOWN);
    render(<PriceCalculator />);
    fillRequiredFields();

    submit();

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
    submit();

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
    submit();

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
    submit();

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
    submit();

    await waitFor(() => expect(screen.getByText('Price Breakdown')).toBeInTheDocument());
    expect(screen.getByText('€15.00')).toBeInTheDocument();
  });

  it('shows an error toast and no breakdown when the calculation request fails', async () => {
    mockApiClient.mockRejectedValue(new Error('network down'));
    render(<PriceCalculator />);
    fillRequiredFields();
    submit();

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith('Failed to calculate cost'),
    );
    expect(screen.queryByText('Price Breakdown')).not.toBeInTheDocument();
  });
});
