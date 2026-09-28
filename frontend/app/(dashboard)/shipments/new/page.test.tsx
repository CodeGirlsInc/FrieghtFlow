import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewShipmentPage from './page';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { SUPPORTED_CURRENCIES_HINT } from '../../../../lib/validation/currency';

const mockBack = jest.fn();
const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams('');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush, replace: jest.fn() }),
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

const stepButton = (n: number) =>
  screen.getByRole('button', { name: new RegExp(`^Step ${n} of 4:`) });

const allStepButtons = () => screen.getAllByRole('button', { name: /^Step \d of 4:/ });

/** Fills step 1 in and advances to step 2 (Cargo). */
async function advanceToCargo() {
  fireEvent.change(screen.getByLabelText(/Origin/), { target: { value: 'Lagos' } });
  fireEvent.change(screen.getByLabelText(/Destination/), { target: { value: 'Abuja' } });
  fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
  await screen.findByLabelText(/Description/);
}

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
  mockSearchParams = new URLSearchParams('');
});

describe('NewShipmentPage — step progress indicator', () => {
  it('renders each step as a real <button> inside a labelled nav', () => {
    render(<NewShipmentPage />);

    const nav = screen.getByRole('navigation', { name: 'Shipment creation steps' });
    expect(nav).toBeInTheDocument();
    expect(nav.tagName).toBe('NAV');

    const buttons = allStepButtons();
    expect(buttons).toHaveLength(4);
    buttons.forEach((b) => expect(b.tagName).toBe('BUTTON'));
  });

  it('marks the current step with aria-current and exposes it as a disabled marker, not a control', () => {
    render(<NewShipmentPage />);

    expect(stepButton(1)).toHaveAttribute('aria-current', 'step');
    expect(stepButton(1)).toBeDisabled();
    expect(stepButton(2)).toBeDisabled();
    expect(stepButton(3)).toBeDisabled();
    expect(stepButton(4)).toBeDisabled();
  });

  it('does not let a click skip a step whose data is invalid', async () => {
    render(<NewShipmentPage />);

    // Step 1 is required and empty, so Next is refused…
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    await waitFor(() => expect(screen.getByText('Origin is required')).toBeInTheDocument());
    expect(stepButton(1)).toHaveAttribute('aria-current', 'step');
    // …and step 2 was never reached, so it is not a jump target.
    expect(stepButton(2)).toBeDisabled();
  });

  it('a completed step becomes clickable and jumps back to it', async () => {
    render(<NewShipmentPage />);
    await advanceToCargo();

    expect(stepButton(2)).toHaveAttribute('aria-current', 'step');
    expect(stepButton(1)).toBeEnabled();
    // Step 3 has never been visited, so it stays out of reach.
    expect(stepButton(3)).toBeDisabled();

    fireEvent.click(stepButton(1));

    expect(stepButton(1)).toHaveAttribute('aria-current', 'step');
    expect(screen.getByLabelText(/Origin/)).toHaveValue('Lagos');
  });

  it('keeps already-visited steps reachable after jumping backwards', async () => {
    render(<NewShipmentPage />);
    await advanceToCargo();

    fireEvent.click(stepButton(1));
    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    await screen.findByLabelText(/Description/);

    // Came back to step 2 from step 1, so step 1 must still be clickable.
    expect(stepButton(1)).toBeEnabled();
    fireEvent.click(stepButton(1));
    expect(stepButton(1)).toHaveAttribute('aria-current', 'step');
  });

  it('a click on a disabled step does nothing', async () => {
    render(<NewShipmentPage />);
    await advanceToCargo();

    fireEvent.click(stepButton(4));
    fireEvent.click(stepButton(2));

    expect(stepButton(2)).toHaveAttribute('aria-current', 'step');
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
  });

  it('is keyboard reachable and operable with Enter', async () => {
    render(<NewShipmentPage />);
    await advanceToCargo();

    const back = stepButton(1);
    back.focus();
    expect(back).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    expect(stepButton(1)).toHaveAttribute('aria-current', 'step');
  });

  it('still steps forward with Next and back with Back', async () => {
    render(<NewShipmentPage />);
    await advanceToCargo();

    expect(stepButton(2)).toHaveAttribute('aria-current', 'step');

    fireEvent.click(screen.getByRole('button', { name: '← Back' }));
    expect(stepButton(1)).toHaveAttribute('aria-current', 'step');

    fireEvent.click(screen.getByRole('button', { name: 'Next →' }));
    await screen.findByLabelText(/Description/);
    expect(stepButton(2)).toHaveAttribute('aria-current', 'step');
  });
});

describe('NewShipmentPage — discarding entered data', () => {
  it('cancels straight out of an untouched form without nagging', () => {
    render(<NewShipmentPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('prompts before discarding, states what is lost, and is accessible', async () => {
    render(<NewShipmentPage />);
    fireEvent.change(screen.getByLabelText(/Origin/), { target: { value: 'Lagos' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName('Discard this shipment?');
    expect(dialog).toHaveTextContent(/route, cargo, pricing and schedule/i);
    // Focus is moved into the dialog, on the safe action.
    expect(screen.getByRole('button', { name: 'Keep editing' })).toHaveFocus();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('dismissing the dialog keeps every field intact and returns focus to the trigger', async () => {
    render(<NewShipmentPage />);
    fireEvent.change(screen.getByLabelText(/Origin/), { target: { value: 'Lagos' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockBack).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Origin/)).toHaveValue('Lagos');
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('Escape dismisses the dialog and preserves the data', () => {
    render(<NewShipmentPage />);
    fireEvent.change(screen.getByLabelText(/Origin/), { target: { value: 'Lagos' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockBack).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Origin/)).toHaveValue('Lagos');
  });

  it('confirming the dialog navigates away', () => {
    render(<NewShipmentPage />);
    fireEvent.change(screen.getByLabelText(/Origin/), { target: { value: 'Lagos' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard and leave' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('does not prompt once a field is cleared back to empty', () => {
    render(<NewShipmentPage />);
    const origin = screen.getByLabelText(/Origin/);
    fireEvent.change(origin, { target: { value: 'Lagos' } });
    fireEvent.change(origin, { target: { value: '' } });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('treats a draft prefilled through query params as work worth losing', () => {
    mockSearchParams = new URLSearchParams('origin=Lagos&destination=Abuja&price=1500');
    render(<NewShipmentPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('registers a beforeunload guard only while the form is dirty', () => {
    const addSpy = jest.spyOn(window, 'addEventListener');
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<NewShipmentPage />);
    expect(addSpy.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(0);

    fireEvent.change(screen.getByLabelText(/Origin/), { target: { value: 'Lagos' } });
    expect(addSpy.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(1);

    unmount();
    expect(removeSpy.mock.calls.filter(([type]) => type === 'beforeunload')).toHaveLength(1);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
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
