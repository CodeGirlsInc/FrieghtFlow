import type { QueryShipmentParams } from '../types/shipment.types';
import type { QueryAdminShipmentsParams, QueryUsersParams } from './api/admin.api';

/**
 * Query key factory following React Query conventions.
 *
 * All keys are arrays so `queryKey` can be invalidated at any level:
 *   - `queryKey: queryKeys.shipments.all` invalidates every shipment query
 *   - `queryKey: queryKeys.shipments.list({ status: 'PENDING' })` invalidates one list variant
 *
 * @see https://tanstack.com/query/latest/docs/guides/query-keys
 */
export const queryKeys = {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // ── Shipments ────────────────────────────────────────────────────────────────
  shipments: {
    all: ['shipments'] as const,
    lists: () => [...queryKeys.shipments.all, 'list'] as const,
    list: (params: QueryShipmentParams) =>
      [...queryKeys.shipments.lists(), params] as const,
    details: () => [...queryKeys.shipments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.shipments.details(), id] as const,
    history: (id: string) => [...queryKeys.shipments.detail(id), 'history'] as const,
    marketplace: (params: QueryShipmentParams) =>
      [...queryKeys.shipments.all, 'marketplace', params] as const,
    track: (trackingNumber: string) =>
      [...queryKeys.shipments.all, 'track', trackingNumber] as const,
  },

  // ── Notifications ────────────────────────────────────────────────────────────
  notifications: {
    all: ['notifications'] as const,
    preferences: () => [...queryKeys.notifications.all, 'preferences'] as const,
  },

  // ── Admin ────────────────────────────────────────────────────────────────────
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    users: {
      all: [...queryKeys.admin.all, 'users'] as const,
      list: (params: QueryUsersParams) =>
        [...queryKeys.admin.users.all, params] as const,
      detail: (id: string) => [...queryKeys.admin.users.all, 'detail', id] as const,
    },
    shipments: {
      all: [...queryKeys.admin.all, 'shipments'] as const,
      list: (params: QueryAdminShipmentsParams) =>
        [...queryKeys.admin.shipments.all, params] as const,
    },
  },

  // ── Addresses ────────────────────────────────────────────────────────────────
  addresses: {
    all: ['addresses'] as const,
    list: () => [...queryKeys.addresses.all, 'list'] as const,
  },
} as const;
