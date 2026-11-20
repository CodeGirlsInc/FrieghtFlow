import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ShipmentsInfiniteList from './ShipmentsInfiniteList';
import { shipmentApi } from '../../lib/api/shipment.api';
import type { Shipment } from '../../types/shipment.types';

jest.mock('../../lib/api/shipment.api');
const mockList = shipmentApi.list as jest.MockedFunction<typeof shipmentApi.list>;

jest.mock('./shipment-card', () => ({
  ShipmentCard: ({ shipment }: { shipment: Shipment }) => (
    <div data-testid="shipment-card">{shipment.trackingNumber}</div>
  ),
}));

// jsdom has no IntersectionObserver. Capture the callback so tests can
// simulate the sentinel scrolling into view.
let ioCallback: IntersectionObserverCallback | null = null;
const observe = jest.fn();
const disconnect = jest.fn();

beforeAll(() => {
  (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver = jest
    .fn()
    .mockImplementation((callback: IntersectionObserverCallback) => {
      ioCallback = callback;
      return { observe, disconnect, unobserve: jest.fn() };
    });
});

function triggerIntersection(isIntersecting: boolean) {
  act(() => {
    ioCallback?.(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

function makeShipment(overrides: Partial<Shipment> = {}): Shipment {
  return {
    id: `s-${Math.random()}`,
    trackingNumber: 'TRK-1',
    shipperId: 'u1',
    shipper: { id: 'u1', firstName: 'A', lastName: 'B', email: 'a@b.com' },
    carrierId: null,
    carrier: null,
    origin: 'NYC',
    destination: 'LA',
    cargoDescription: 'Boxes',
    weightKg: 10,
    volumeCbm: null,
    price: 100,
    currency: 'USD',
    status: 'pending' as Shipment['status'],
    notes: null,
    ...overrides,
  } as Shipment;
}

function renderList() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ShipmentsInfiniteList />
    </QueryClientProvider>,
  );
}

describe('ShipmentsInfiniteList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the empty state when there are no shipments', async () => {
    mockList.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
    renderList();

    expect(await screen.findByText('No shipments found.')).toBeInTheDocument();
  });

  it('renders a single page and shows "reached the end" with no fetch of page 2', async () => {
    const shipments = [makeShipment({ id: '1', trackingNumber: 'TRK-1' })];
    mockList.mockResolvedValue({ data: shipments, total: 1, page: 1, limit: 10, totalPages: 1 });
    renderList();

    await waitFor(() => expect(screen.getAllByTestId('shipment-card')).toHaveLength(1));
    expect(screen.getByText("You've reached the end.")).toBeInTheDocument();
    expect(mockList).toHaveBeenCalledTimes(1);
  });

  it('fetches the next page when the sentinel intersects, and stops requesting once exhausted', async () => {
    const page1 = Array.from({ length: 10 }, (_, i) => makeShipment({ id: `p1-${i}` }));
    const page2 = Array.from({ length: 5 }, (_, i) => makeShipment({ id: `p2-${i}` }));
    mockList
      .mockResolvedValueOnce({ data: page1, total: 15, page: 1, limit: 10, totalPages: 2 })
      .mockResolvedValueOnce({ data: page2, total: 15, page: 2, limit: 10, totalPages: 2 });

    renderList();
    await waitFor(() => expect(screen.getAllByTestId('shipment-card')).toHaveLength(10));

    triggerIntersection(true);

    await waitFor(() => expect(screen.getAllByTestId('shipment-card')).toHaveLength(15));
    expect(mockList).toHaveBeenCalledTimes(2);
    expect(screen.getByText("You've reached the end.")).toBeInTheDocument();
  });

  it('does not trigger a second concurrent fetch while one page is already loading (rapid scroll)', async () => {
    const page1 = Array.from({ length: 10 }, (_, i) => makeShipment({ id: `p1-${i}` }));
    const page2 = Array.from({ length: 10 }, (_, i) => makeShipment({ id: `p2-${i}` }));
    let resolvePage2: (v: {
      data: Shipment[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }) => void = () => {};
    mockList
      .mockResolvedValueOnce({ data: page1, total: 30, page: 1, limit: 10, totalPages: 3 })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePage2 = resolve;
          }),
      );

    renderList();
    await waitFor(() => expect(screen.getAllByTestId('shipment-card')).toHaveLength(10));

    // First intersection kicks off the page-2 fetch.
    triggerIntersection(true);
    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));

    // Further "sentinel still visible" signals, as a rapid scroll would fire,
    // must not start a second concurrent request while page 2 is in flight.
    triggerIntersection(true);
    triggerIntersection(true);
    expect(mockList).toHaveBeenCalledTimes(2);

    resolvePage2({ data: page2, total: 30, page: 2, limit: 10, totalPages: 3 });
    await waitFor(() => expect(screen.getAllByTestId('shipment-card')).toHaveLength(20));
    expect(mockList).toHaveBeenCalledTimes(2);
  });

  it('shows an error message when the initial fetch fails', async () => {
    mockList.mockRejectedValue(new Error('boom'));
    renderList();

    expect(
      await screen.findByText('Failed to load shipments. Please try again.'),
    ).toBeInTheDocument();
  });

  it('keeps the already-loaded first page visible (with an inline error) when a subsequent-page fetch fails, instead of wiping the list', async () => {
    const page1 = Array.from({ length: 10 }, (_, i) => makeShipment({ id: `p1-${i}` }));
    mockList
      .mockResolvedValueOnce({ data: page1, total: 20, page: 1, limit: 10, totalPages: 2 })
      .mockRejectedValueOnce(new Error('page 2 failed'));

    renderList();
    await waitFor(() => expect(screen.getAllByTestId('shipment-card')).toHaveLength(10));

    triggerIntersection(true);

    await waitFor(() => expect(mockList).toHaveBeenCalledTimes(2));
    // The already-rendered first page stays visible — a failed subsequent
    // page must not wipe out what's already loaded, and it does NOT silently
    // stop: an inline error is shown so the user knows more didn't load.
    expect(screen.getAllByTestId('shipment-card')).toHaveLength(10);
    expect(
      await screen.findByText('Failed to load more shipments. Scroll down to retry.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Failed to load shipments. Please try again.')).not.toBeInTheDocument();
  });
});
