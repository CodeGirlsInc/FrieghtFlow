import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShipmentDetailPage from './page';
import { useAuthStore } from '../../../../stores/auth.store';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { ShipmentStatus, type Shipment } from '../../../../types/shipment.types';
import type { User } from '../../../../types/auth.types';

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 's-1' }),
  useRouter: () => ({ push: mockPush, back: mockBack, replace: jest.fn() }),
}));

jest.mock('../../../../lib/api/shipment.api', () => ({
  shipmentApi: {
    getById: jest.fn(),
    getHistory: jest.fn(),
    cancel: jest.fn(),
    resolveDispute: jest.fn(),
  },
}));
const mockGetById = shipmentApi.getById as jest.MockedFunction<typeof shipmentApi.getById>;
const mockGetHistory = shipmentApi.getHistory as jest.MockedFunction<typeof shipmentApi.getHistory>;
const mockCancel = shipmentApi.cancel as jest.MockedFunction<typeof shipmentApi.cancel>;
const mockResolve = shipmentApi.resolveDispute as jest.MockedFunction<typeof shipmentApi.resolveDispute>;

const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToast.error(...args),
    success: (...args: unknown[]) => mockToast.success(...args),
  },
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u-shipper',
    email: 'sam@example.com',
    firstName: 'Sam',
    lastName: 'Shipper',
    role: 'shipper',
    isEmailVerified: true,
    isActive: true,
    walletAddress: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as User;
}

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
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
    status: ShipmentStatus.PENDING,
    notes: null,
    pickupDate: null,
    estimatedDeliveryDate: null,
    actualDeliveryDate: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-05T00:00:00.000Z',
    ...overrides,
  } as Shipment;
}

const resetAuthStore = (user: User | null) =>
  useAuthStore.setState({ user, isAuthenticated: !!user, isLoading: false });

/** Renders the page and waits for the shipment to load. */
async function renderPage(shipment: Shipment) {
  mockGetById.mockResolvedValue(shipment);
  mockGetHistory.mockResolvedValue([]);
  const view = render(<ShipmentDetailPage />);
  expect(await screen.findByText(shipment.trackingNumber)).toBeInTheDocument();
  return view;
}

const confirmButton = () => screen.getByRole('button', { name: /^(Cancel shipment|Confirm)$/ });

beforeEach(() => {
  jest.resetAllMocks();
  resetAuthStore(makeUser());
  mockCancel.mockResolvedValue(makeShipment({ status: ShipmentStatus.CANCELLED }));
  mockResolve.mockResolvedValue(makeShipment({ status: ShipmentStatus.COMPLETED }));
  mockGetHistory.mockResolvedValue([]);
});

// ── FE-190 — cancellation records a real reason ────────────────────────────────

describe('ShipmentDetailPage — cancelling requires a real reason (FE-190)', () => {
  it('no longer calls shipmentApi.cancel on a single click', async () => {
    await renderPage(makeShipment());

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Cancel this shipment?' })).toBeInTheDocument();
  });

  it('does not ship the old canned reason literal', async () => {
    await renderPage(makeShipment());

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(document.body.textContent).not.toContain('Cancelled by user');
  });

  it('keeps Confirm disabled for an empty or whitespace-only reason', async () => {
    await renderPage(makeShipment());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(confirmButton()).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Reason for cancelling'), {
      target: { value: '   ' },
    });

    expect(confirmButton()).toBeDisabled();
    expect(mockCancel).not.toHaveBeenCalled();
  });

  it('cancels with the reason the user typed, trimmed', async () => {
    const user = userEvent.setup();
    await renderPage(makeShipment());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.type(screen.getByLabelText('Reason for cancelling'), 'Carrier never showed up');
    await user.click(confirmButton());

    await waitFor(() => expect(mockCancel).toHaveBeenCalledWith('s-1', 'Carrier never showed up'));
  });

  it('explains that a reason is required and caps how much can be typed', async () => {
    await renderPage(makeShipment());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    const field = screen.getByLabelText('Reason for cancelling') as HTMLTextAreaElement;
    expect(screen.getByText(/Required, up to \d+ characters/)).toBeInTheDocument();
    expect(screen.getByText(/recorded on/i)).toBeInTheDocument();
    expect(field.maxLength).toBeGreaterThan(0);
    expect(field.maxLength).toBe(500);
  });

  it('shows the success toast and closes the dialog on success', async () => {
    const user = userEvent.setup();
    await renderPage(makeShipment());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.type(screen.getByLabelText('Reason for cancelling'), 'Duplicate booking');
    await user.click(confirmButton());

    await waitFor(() =>
      expect(mockToast.success).toHaveBeenCalledWith('Shipment cancelled'),
    );
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('shows the error toast and keeps the typed reason when cancelling fails', async () => {
    const user = userEvent.setup();
    mockCancel.mockRejectedValue(new Error('boom'));
    await renderPage(makeShipment());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.type(screen.getByLabelText('Reason for cancelling'), 'Changed my mind');
    await user.click(confirmButton());

    await waitFor(() =>
      expect(mockToast.error).toHaveBeenCalledWith('Action failed. Please try again.'),
    );
    expect(screen.getByLabelText('Reason for cancelling')).toHaveValue('Changed my mind');
  });

  it('abandons the action when the dialog is dismissed', async () => {
    const user = userEvent.setup();
    await renderPage(makeShipment());

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    // The dialog's own dismiss button — also labelled "Cancel".
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(mockCancel).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('is offered to the carrier as well as the shipper', async () => {
    resetAuthStore(makeUser({ id: 'u-carrier', role: 'carrier' }));
    await renderPage(makeShipment({ status: ShipmentStatus.ACCEPTED }));

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });
});

// ── FE-191 — admin resolve requires a note, like the admin queue ───────────────

describe('ShipmentDetailPage — admin dispute resolution requires a note (FE-191)', () => {
  const disputed = () => makeShipment({ status: ShipmentStatus.DISPUTED });

  beforeEach(() => {
    resetAuthStore(makeUser({ id: 'u-admin', role: 'admin' }));
  });

  it('does not resolve on a single click and shows no canned reason', async () => {
    await renderPage(disputed());

    fireEvent.click(screen.getByRole('button', { name: 'Resolve: Complete' }));

    expect(mockResolve).not.toHaveBeenCalled();
    expect(document.body.textContent).not.toContain('Resolved by admin');
    expect(screen.getByRole('dialog', { name: 'Resolve as Completed?' })).toBeInTheDocument();
  });

  it('blocks the request until a resolution note is typed', async () => {
    await renderPage(disputed());
    fireEvent.click(screen.getByRole('button', { name: 'Resolve: Complete' }));

    expect(confirmButton()).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Resolution Note'), { target: { value: '  ' } });
    expect(confirmButton()).toBeDisabled();
    expect(mockResolve).not.toHaveBeenCalled();
  });

  it('resolves as COMPLETED with the note the admin typed', async () => {
    const user = userEvent.setup();
    await renderPage(disputed());

    await user.click(screen.getByRole('button', { name: 'Resolve: Complete' }));
    await user.type(screen.getByLabelText('Resolution Note'), 'POD received, releasing payment');
    await user.click(confirmButton());

    await waitFor(() =>
      expect(mockResolve).toHaveBeenCalledWith(
        's-1',
        ShipmentStatus.COMPLETED,
        'POD received, releasing payment',
      ),
    );
  });

  it('resolves as CANCELLED with the note the admin typed', async () => {
    const user = userEvent.setup();
    await renderPage(disputed());

    await user.click(screen.getByRole('button', { name: 'Resolve: Cancel' }));
    await user.type(screen.getByLabelText('Resolution Note'), 'Cargo never arrived');
    await user.click(confirmButton());

    await waitFor(() =>
      expect(mockResolve).toHaveBeenCalledWith(
        's-1',
        ShipmentStatus.CANCELLED,
        'Cargo never arrived',
      ),
    );
  });

  it('never sends either hardcoded canned reason', async () => {
    const user = userEvent.setup();
    await renderPage(disputed());

    await user.click(screen.getByRole('button', { name: 'Resolve: Complete' }));
    await user.type(screen.getByLabelText('Resolution Note'), 'Shipment was delivered on time');
    await user.click(confirmButton());
    await waitFor(() => expect(mockResolve).toHaveBeenCalled());

    expect(mockResolve).not.toHaveBeenCalledWith('s-1', expect.anything(), 'Resolved by admin — completed');
    expect(mockResolve).not.toHaveBeenCalledWith('s-1', expect.anything(), 'Resolved by admin — cancelled');
  });

  it('is not offered to a non-admin viewer of the same shipment', async () => {
    resetAuthStore(makeUser({ id: 'u-shipper', role: 'shipper' }));
    await renderPage(disputed());

    expect(screen.queryByRole('button', { name: 'Resolve: Complete' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Resolve: Cancel' })).not.toBeInTheDocument();
  });
});

// ── FE-192 — an invalid stored currency must not crash the price ───────────────

describe('ShipmentDetailPage — price rendering survives a bogus currency (FE-192)', () => {
  it('renders a fallback instead of throwing for an unrecognised currency code', async () => {
    await renderPage(makeShipment({ currency: '123' }));

    expect(screen.getByText('123 3,500.00')).toBeInTheDocument();
  });

  it('still renders a valid currency exactly as before', async () => {
    await renderPage(makeShipment({ currency: 'USD' }));

    expect(screen.getByText('$3,500.00')).toBeInTheDocument();
  });
});
