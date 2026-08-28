import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminShipmentsPage from './page';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi } from '../../../../lib/api/admin.api';
import { ShipmentStatus } from '../../../../types/shipment.types';
import type { Shipment } from '../../../../types/shipment.types';
import type { User } from '../../../../types/auth.types';

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('../../../../lib/api/admin.api', () => ({
  adminApi: { listShipments: jest.fn() },
}));
const mockListShipments = adminApi.listShipments as jest.MockedFunction<
  typeof adminApi.listShipments
>;

const mockToastError = jest.fn();
jest.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => mockToastError(...args) },
}));

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    walletAddress: null,
    verificationToken: null,
    verificationTokenExpiry: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 's1',
    trackingNumber: 'TRK-001',
    shipperId: 'u1',
    shipper: { id: 'u1', firstName: 'Jane', lastName: 'Doe', email: 'jane@x.com' },
    carrierId: null,
    carrier: null,
    origin: 'NYC',
    destination: 'LA',
    cargoDescription: 'Boxes',
    weightKg: 10,
    volumeCbm: null,
    price: 250,
    currency: 'USD',
    status: ShipmentStatus.PENDING,
    notes: null,
    createdAt: new Date('2026-01-01').toISOString(),
    ...overrides,
  } as Shipment;
}

const resetAuthStore = (user: User | null) =>
  useAuthStore.setState({ user, isAuthenticated: !!user, isLoading: false });

describe('AdminShipmentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects a non-admin user to the dashboard and renders nothing', async () => {
    resetAuthStore(makeUser({ role: 'shipper' }));
    const { container } = render(<AdminShipmentsPage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/dashboard'));
    expect(container).toBeEmptyDOMElement();
    expect(mockListShipments).not.toHaveBeenCalled();
  });

  it('loads and displays shipments for an admin user', async () => {
    resetAuthStore(makeUser());
    mockListShipments.mockResolvedValue({
      data: [makeShipment({ trackingNumber: 'TRK-001' })],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    render(<AdminShipmentsPage />);

    expect(await screen.findByText('TRK-001')).toBeInTheDocument();
    expect(screen.getByText('1 total shipments')).toBeInTheDocument();
    expect(mockListShipments).toHaveBeenCalledWith({
      status: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('shows an empty state when there are no shipments', async () => {
    resetAuthStore(makeUser());
    mockListShipments.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
    render(<AdminShipmentsPage />);

    expect(await screen.findByText('No shipments found.')).toBeInTheDocument();
  });

  it('refetches with the selected status filter and resets to page 1', async () => {
    resetAuthStore(makeUser());
    mockListShipments.mockResolvedValue({
      data: [makeShipment()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    render(<AdminShipmentsPage />);
    await waitFor(() => expect(mockListShipments).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: 'Disputed' }));

    await waitFor(() =>
      expect(mockListShipments).toHaveBeenLastCalledWith({
        status: ShipmentStatus.DISPUTED,
        page: 1,
        limit: 20,
      }),
    );
  });

  it('paginates to the next page and back', async () => {
    resetAuthStore(makeUser());
    mockListShipments.mockResolvedValue({
      data: Array.from({ length: 20 }, (_, i) => makeShipment({ id: `s${i}`, trackingNumber: `T${i}` })),
      total: 40,
      page: 1,
      limit: 20,
      totalPages: 2,
    });
    render(<AdminShipmentsPage />);
    await waitFor(() => expect(mockListShipments).toHaveBeenCalledTimes(1));

    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();

    fireEvent.click(nextButton);

    await waitFor(() =>
      expect(mockListShipments).toHaveBeenLastCalledWith({
        status: undefined,
        page: 2,
        limit: 20,
      }),
    );
  });

  it('shows an error toast when loading shipments fails', async () => {
    resetAuthStore(makeUser());
    mockListShipments.mockRejectedValue(new Error('boom'));
    render(<AdminShipmentsPage />);

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith('Failed to load shipments'));
  });
});
