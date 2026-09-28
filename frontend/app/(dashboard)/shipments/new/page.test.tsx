import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewShipmentPage from './page';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { SUPPORTED_CURRENCIES_HINT } from '../../../../lib/validation/currency';

const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('../../../../lib/api/shipment.api', () => ({
  shipmentApi: { create: jest.fn() },
}));
const mockCreate = shipmentApi.create as jest.MockedFunction<typeof shipmentApi.create>;

const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToast.error(...args),
    success: (...args: unknown[]) => mockToast.success(...args),
  },
}));

/** Walks the multi-step form to the Pricing & Dates step (index 2). */
async function goToPricingStep() {
  const user = userEvent.setup();
  render(<NewShipmentPage />);

  fireEvent.change(screen.getByLabelText('Origin *'), { target: { value: 'Lagos' } });
  fireEvent.change(screen.getByLabelText('Destination *'), { target: { value: 'Accra' } });
  await user.click(screen.getByRole('button', { name: 'Next →' }));

  fireEvent.change(screen.getByLabelText('Description *'), {
    target: { value: 'Palletised electronics' },
  });
  fireEvent.change(screen.getByLabelText('Weight (kg) *'), { target: { value: '500' } });
  await user.click(screen.getByRole('button', { name: 'Next →' }));

  fireEvent.change(screen.getByLabelText('Price *'), { target: { value: '1500' } });
  return user;
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('New shipment form — currency is validated against real codes (FE-192)', () => {
  it('lists the supported currency codes as help text', async () => {
    await goToPricingStep();

    expect(screen.getByText(SUPPORTED_CURRENCIES_HINT)).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');
  });

  it('rejects a three-character code the old length(3) rule let through', async () => {
    await goToPricingStep();

    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'ZZZ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));

    expect(await screen.findByText('Unsupported currency code')).toBeInTheDocument();
    expect(screen.getByLabelText('Currency')).toHaveAttribute('aria-invalid', 'true');
  });

  it.each(['ABC', '123', 'U$D', 'usd'])('rejects %s', async (code) => {
    await goToPricingStep();

    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: code } });
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));

    expect(await screen.findByText('Unsupported currency code')).toBeInTheDocument();
  });

  it.each(['USD', 'NGN', 'EUR', 'GHS'])('accepts the supported code %s and advances', async (code) => {
    const user = await goToPricingStep();

    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: code } });
    await user.click(screen.getByRole('button', { name: 'Next →' }));

    expect(await screen.findByText('Review & Submit')).toBeInTheDocument();
    // The review step echoes the price as "1500 NGN" in a single span.
    expect(
      screen.getByText((_content, element) =>
        element?.tagName === 'SPAN' && element.textContent === `1500 ${code}`,
      ),
    ).toBeInTheDocument();
  });

  it('swaps the help text for the error message, still linked to the field', async () => {
    await goToPricingStep();

    const field = screen.getByLabelText('Currency');
    expect(field).toHaveAttribute('aria-describedby', 'currency-help');
    expect(field).toHaveAccessibleDescription(SUPPORTED_CURRENCIES_HINT);

    fireEvent.change(field, { target: { value: 'ZZZ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));

    await screen.findByText('Unsupported currency code');
    expect(field).toHaveAttribute('aria-describedby', 'currency-help');
    expect(field).toHaveAccessibleDescription('Unsupported currency code');
  });

  it('does not submit a shipment carrying an invalid currency', async () => {
    const user = await goToPricingStep();

    fireEvent.change(screen.getByLabelText('Currency'), { target: { value: 'ZZZ' } });
    await user.click(screen.getByRole('button', { name: 'Next →' }));
    await screen.findByText('Unsupported currency code');

    // The form cannot reach the review step, so it cannot be submitted.
    expect(mockCreate).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next →' })).toBeInTheDocument(),
    );
  });
});
