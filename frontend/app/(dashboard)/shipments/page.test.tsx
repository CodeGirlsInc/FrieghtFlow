import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShipmentsPage from './page';
import { useAuthStore } from '../../../stores/auth.store';
import { shipmentApi } from '../../../lib/api/shipment.api';
import { ShipmentStatus } from '../../../types/shipment.types';
import type { Shipment } from '../../../types/shipment.types';
import type { User } from '../../../types/auth.types';

jest.mock('../../../lib/api/shipment.api', () => ({
  shipmentApi: { list: jest.fn() },
}));
const mockList = shipmentApi.list as jest.MockedFunction<typeof shipmentApi.list>;

const mockToastError = jest.fn();
jest.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

const PAGE_SIZE = 10;

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'shipper@example.com',
    firstName: 'Sam',
    lastName: 'Shipper',
    role: 'shipper',
    isEmailVerified: true,
    isActive: true,
    walletAddress: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
    ...overrides,
  } as User;
}

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 's1',
    trackingNumber: 'TRK-001',
    shipperId: 'u1',
    shipper: { id: 'u1', firstName: 'Sam', lastName: 'Shipper', email: 'shipper@example.com' },
    carrierId: null,
    carrier: null,
    origin: 'Lagos',
    destination: 'Accra',
    cargoDescription: 'Boxes',
    weightKg: 10,
    volumeCbm: null,
    price: 250,
    currency: 'USD',
    status: ShipmentStatus.PENDING,
    notes: null,
    createdAt: new Date('2026-01-01').toISOString(),
    estimatedDeliveryDate: null,
    ...overrides,
  } as Shipment;
}

/** A page of `size` shipments out of `total`, as the API would return it. */
function makeResult(page: number, total: number, size = PAGE_SIZE) {
  const first = (page - 1) * size + 1;
  const count = Math.max(Math.min(size, total - (page - 1) * size), 0);
  return {
    data: Array.from({ length: count }, (_, i) =>
      makeShipment({ id: `s${first + i}`, trackingNumber: `TRK-${first + i}` }),
    ),
    total,
    page,
    limit: size,
    totalPages: Math.ceil(total / size),
  };
}

const resetAuthStore = (user: User | null) =>
  useAuthStore.setState({ user, isAuthenticated: !!user, isLoading: false });

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ShipmentsPage />
    </QueryClientProvider>,
  );
}

describe('ShipmentsPage pagination', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetAuthStore(makeUser());
  });

  it('requests an explicit page and limit', async () => {
    mockList.mockResolvedValue(makeResult(1, 25));

    renderPage();

    await waitFor(() =>
      expect(mockList).toHaveBeenCalledWith({ status: undefined, page: 1, limit: PAGE_SIZE }),
    );
  });

  it('disables Previous on page 1 and shows a truthful caption', async () => {
    mockList.mockResolvedValue(makeResult(1, 25));

    renderPage();

    const nav = await screen.findByRole('navigation', { name: 'Shipments pagination' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
    expect(screen.getByText('Showing 1-10 of 25 shipments')).toBeInTheDocument();
    expect(screen.getByText('1')).toHaveAttribute('aria-current', 'page');
  });

  it('advances to the next page and keeps the caption accurate', async () => {
    mockList.mockResolvedValue(makeResult(1, 25));
    renderPage();
    await screen.findByText('Showing 1-10 of 25 shipments');

    mockList.mockResolvedValue(makeResult(2, 25));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Showing 11-20 of 25 shipments')).toBeInTheDocument();
    expect(mockList).toHaveBeenLastCalledWith({ status: undefined, page: 2, limit: PAGE_SIZE });
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  });

  it('disables Next on the last page', async () => {
    mockList.mockResolvedValue(makeResult(1, 25));
    renderPage();
    await screen.findByText('Showing 1-10 of 25 shipments');

    mockList.mockResolvedValue(makeResult(2, 25));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Showing 11-20 of 25 shipments');

    mockList.mockResolvedValue(makeResult(3, 25));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Showing 21-25 of 25 shipments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
  });

  it('resets to page 1 when the status tab changes', async () => {
    mockList.mockResolvedValue(makeResult(1, 25));
    renderPage();
    await screen.findByText('Showing 1-10 of 25 shipments');

    mockList.mockResolvedValue(makeResult(2, 25));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Showing 11-20 of 25 shipments');

    mockList.mockResolvedValue(makeResult(1, 3));
    fireEvent.click(screen.getByRole('button', { name: 'Pending' }));

    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({
        status: ShipmentStatus.PENDING,
        page: 1,
        limit: PAGE_SIZE,
      }),
    );
    expect(await screen.findByText('Showing 1-3 of 3 shipments')).toBeInTheDocument();
  });

  it('falls back to the last page when the current page no longer exists', async () => {
    mockList.mockResolvedValue(makeResult(1, 25));
    renderPage();
    await screen.findByText('Showing 1-10 of 25 shipments');

    mockList.mockResolvedValue(makeResult(2, 25));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    await screen.findByText('Showing 11-20 of 25 shipments');

    // The list shrank (a deletion) while the user was on page 2, so page 2 is
    // now out of range: the view falls back to the last existing page instead
    // of showing an empty list while `total` is still non-zero.
    mockList.mockResolvedValue(makeResult(1, 8));
    mockList.mockResolvedValueOnce({ data: [], total: 8, page: 2, limit: PAGE_SIZE, totalPages: 1 });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(mockList).toHaveBeenLastCalledWith({ status: undefined, page: 1, limit: PAGE_SIZE }),
    );
    expect(await screen.findByText('Showing 1-8 of 8 shipments')).toBeInTheDocument();
  });

  it('hides the pagination when there is nothing to page', async () => {
    mockList.mockResolvedValue({ data: [], total: 0, page: 1, limit: PAGE_SIZE, totalPages: 0 });

    renderPage();

    expect(await screen.findByText('No shipments found.')).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Shipments pagination' }),
    ).not.toBeInTheDocument();
  });

  it('shows an error toast when loading shipments fails', async () => {
    mockList.mockRejectedValue(new Error('boom'));

    renderPage();

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Failed to load shipments'));
  });
});
