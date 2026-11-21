import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDisputesPage from './page';
import { useAuthStore } from '../../../../stores/auth.store';
import { adminApi } from '../../../../lib/api/admin.api';
import { shipmentApi } from '../../../../lib/api/shipment.api';
import { ShipmentStatus, type Shipment } from '../../../../types/shipment.types';
import type { User } from '../../../../types/auth.types';

const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: jest.fn() }),
}));

jest.mock('../../../../lib/api/admin.api', () => ({
  adminApi: { listShipments: jest.fn(), reconcileEscrow: jest.fn() },
}));
const mockListShipments = adminApi.listShipments as jest.MockedFunction<typeof adminApi.listShipments>;

jest.mock('../../../../lib/api/shipment.api', () => ({
  shipmentApi: { getHistory: jest.fn() },
}));

const mockToast = { success: jest.fn(), error: jest.fn() };
jest.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToast.error(...args),
    success: (...args: unknown[]) => mockToast.success(...args),
  },
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
  } as User;
}

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: 's1',
    trackingNumber: 'TRK-001',
    shipperId: 'u-shipper',
    shipper: { id: 'u-shipper', firstName: 'Jane', lastName: 'Doe', email: 'jane@x.com' },
    carrierId: 'u-carrier',
    carrier: { id: 'u-carrier', firstName: 'Cara', lastName: 'Carrier', email: 'cara@x.com' },
    origin: 'Lagos',
    destination: 'Accra',
    cargoDescription: 'Palletised electronics',
    weightKg: 10,
    volumeCbm: null,
    price: 250,
    currency: 'USD',
    status: ShipmentStatus.DISPUTED,
    notes: null,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-02').toISOString(),
    ...overrides,
  } as Shipment;
}

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminDisputesPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  jest.resetAllMocks();
  useAuthStore.setState({ user: makeUser(), isAuthenticated: true, isLoading: false });
  (shipmentApi.getHistory as jest.Mock).mockResolvedValue([]);
});

describe('AdminDisputesPage — price formatting (FE-192)', () => {
  it('renders a valid currency exactly as before', async () => {
    mockListShipments.mockResolvedValue({
      data: [makeShipment({ price: 250 })],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    renderPage();

    expect(await screen.findByText('TRK-001')).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
  });

  it('does not crash on a currency code Intl rejects, in the queue or the detail panel', async () => {
    mockListShipments.mockResolvedValue({
      data: [makeShipment({ currency: '123' })],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });

    expect(() => renderPage()).not.toThrow();
    expect(await screen.findByText('123 250.00')).toBeInTheDocument();

    // …and the review drawer, which formats the same value a second time.
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    await waitFor(() => expect(screen.getByText('Status History')).toBeInTheDocument());
    expect(screen.getAllByText('123 250.00').length).toBe(2);
  });
});

describe('AdminDisputesPage — escrow status (#1846)', () => {
  it('shows the escrow amount and the DB vs on-chain status in the detail panel', async () => {
    mockListShipments.mockResolvedValue({
      data: [makeShipment()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    (adminApi.reconcileEscrow as jest.Mock).mockResolvedValue({
      shipmentId: 's1',
      offChain: {
        paymentId: 'p1',
        status: 'funded',
        onChainShipmentId: 1,
        stellarTxHash: 'tx-1',
        amount: 250,
        assetCode: 'USD',
      },
      onChain: {
        shipmentId: 1,
        shipper: 'GSHIPPER',
        carrier: 'GCARRIER',
        amount: 250,
        status: 'Funded',
        fundedAt: 1_700_000_000,
        settledAt: 0,
      },
      match: true,
      mismatches: [],
    });

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Review' }));

    const escrowSection = (await screen.findByText('Escrow status')).parentElement;
    expect(escrowSection?.textContent).toContain('$250.00');
    expect(escrowSection?.textContent).toContain('DB funded');
    expect(escrowSection?.textContent).toContain('on-chain Funded');
    expect(screen.getByText('Off-chain and on-chain status agree.')).toBeInTheDocument();
  });

  it('highlights the mismatch before resolving when statuses disagree', async () => {
    mockListShipments.mockResolvedValue({
      data: [makeShipment()],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    });
    (adminApi.reconcileEscrow as jest.Mock).mockResolvedValue({
      shipmentId: 's1',
      offChain: {
        paymentId: 'p1',
        status: 'pending',
        onChainShipmentId: 1,
        stellarTxHash: null,
        amount: 250,
        assetCode: 'USD',
      },
      onChain: {
        shipmentId: 1,
        shipper: 'GSHIPPER',
        carrier: 'GCARRIER',
        amount: 250,
        status: 'Funded',
        fundedAt: 1_700_000_000,
        settledAt: 0,
      },
      match: false,
      mismatches: ['Status mismatch: off-chain=pending, on-chain=Funded'],
    });

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Review' }));

    const escrowSection = await screen.findByText('Escrow status');
    expect(escrowSection.parentElement?.textContent).toContain(
      'Status mismatch: off-chain=pending, on-chain=Funded',
    );
    expect(
      screen.queryByText('Off-chain and on-chain status agree.'),
    ).not.toBeInTheDocument();
  });
});
