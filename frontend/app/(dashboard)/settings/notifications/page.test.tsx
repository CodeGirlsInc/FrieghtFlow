import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NotificationPreferencesPage from './page';
import { apiClient } from '../../../../lib/api/client';
import type { NotificationPreferencesResponse } from '../../../../lib/api/notifications.api';

jest.mock('../../../../lib/api/client');
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const { toast } = jest.requireMock('sonner') as {
  toast: { success: jest.Mock; error: jest.Mock };
};
const mockApiClient = apiClient as jest.MockedFunction<typeof apiClient>;

/** Mirrors backend/src/notification-preferences (entity + update DTO). */
function makeEntity(
  overrides: Partial<NotificationPreferencesResponse> = {},
): NotificationPreferencesResponse {
  return {
    id: 'np-1',
    userId: 'u-1',
    shipmentAccepted: true,
    shipmentInTransit: false,
    shipmentDelivered: true,
    shipmentCompleted: false,
    shipmentCancelled: true,
    shipmentDisputed: false,
    disputeResolved: true,
    updatedAt: '2026-08-20T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Wires apiClient to an in-memory copy of the backend preferences row so that
 * GET reflects state and PATCH persists it — a real round-trip.
 */
function wireBackend(entity: NotificationPreferencesResponse, opts: { failPatch?: boolean } = {}) {
  const state = { ...entity };
  mockApiClient.mockImplementation((path, options) => {
    const reqOpts = options as { method?: string; body?: string } | undefined;
    if (path !== '/notifications/preferences') {
      return Promise.reject(new Error(`unexpected path ${path}`));
    }
    if (reqOpts?.method === 'PATCH') {
      if (opts.failPatch) return Promise.reject(new Error('save failed'));
      Object.assign(state, JSON.parse(reqOpts.body ?? '{}'));
      return Promise.resolve({ ...state });
    }
    return Promise.resolve({ ...state });
  });
  return state;
}

beforeEach(() => jest.clearAllMocks());

describe('Notification preferences page', () => {
  it('renders each toggle reflecting the persisted backend state', async () => {
    wireBackend(makeEntity());
    render(<NotificationPreferencesPage />);

    const accepted = await screen.findByRole('switch', { name: 'Toggle Shipment Accepted' });
    expect(accepted).toHaveAttribute('aria-checked', 'true');

    expect(
      screen.getByRole('switch', { name: 'Toggle Shipment In Transit' }),
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('switch', { name: 'Toggle Shipment Completed' }),
    ).toHaveAttribute('aria-checked', 'false');
    expect(
      screen.getByRole('switch', { name: 'Toggle Dispute Resolved' }),
    ).toHaveAttribute('aria-checked', 'true');

    // All 7 backend-backed preferences are shown.
    expect(screen.getAllByRole('switch')).toHaveLength(7);
  });

  it('persists a toggle to the backend using the DTO key and reflects the new state', async () => {
    wireBackend(makeEntity({ shipmentInTransit: false }));
    render(<NotificationPreferencesPage />);

    const toggle = await screen.findByRole('switch', { name: 'Toggle Shipment In Transit' });
    fireEvent.click(toggle);

    await waitFor(() =>
      expect(mockApiClient).toHaveBeenCalledWith('/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ shipmentInTransit: true }),
      }),
    );
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'true'));
    expect(toast.success).toHaveBeenCalledWith('Preference saved');

    // A fresh mount reads the persisted value back from the (in-memory) backend.
    screen.getByRole('switch', { name: 'Toggle Shipment In Transit' });
  });

  it('reads persisted changes back on remount (true round-trip)', async () => {
    const state = wireBackend(makeEntity({ shipmentCompleted: false }));
    const first = render(<NotificationPreferencesPage />);

    const toggle = await first.findByRole('switch', { name: 'Toggle Shipment Completed' });
    fireEvent.click(toggle);
    await waitFor(() => expect(state.shipmentCompleted).toBe(true));
    first.unmount();

    const second = render(<NotificationPreferencesPage />);
    await waitFor(() =>
      expect(
        second.getByRole('switch', { name: 'Toggle Shipment Completed' }),
      ).toHaveAttribute('aria-checked', 'true'),
    );
  });

  it('reverts the toggle and surfaces an error when the backend rejects the update', async () => {
    wireBackend(makeEntity({ shipmentDelivered: true }), { failPatch: true });
    render(<NotificationPreferencesPage />);

    const toggle = await screen.findByRole('switch', { name: 'Toggle Shipment Delivered' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(toggle);

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Failed to save preference'));
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'true'));
  });

  it('falls back to an all-enabled default list when preferences cannot be loaded', async () => {
    mockApiClient.mockRejectedValue(new Error('network down'));
    render(<NotificationPreferencesPage />);

    await waitFor(() => expect(screen.getAllByRole('switch')).toHaveLength(7));
    screen.getAllByRole('switch').forEach((sw) => {
      expect(sw).toHaveAttribute('aria-checked', 'true');
    });
  });
});
