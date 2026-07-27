'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-keys';
import { adminApi } from '../lib/api/admin.api';
import type { QueryUsersParams, QueryAdminShipmentsParams } from '../lib/api/admin.api';

// ── Stats ─────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: adminApi.getStats,
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useAdminUsers(params: QueryUsersParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.users.list(params),
    queryFn: () => adminApi.listUsers(params),
  });
}

export function useAdminUserDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.admin.users.detail(id),
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats() });
    },
  });
}

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'SHIPPER' | 'CARRIER' | 'ADMIN' }) =>
      adminApi.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users.all });
    },
  });
}

// ── Admin Shipments ───────────────────────────────────────────────────────────

export function useAdminShipments(params: QueryAdminShipmentsParams = {}) {
  return useQuery({
    queryKey: queryKeys.admin.shipments.list(params),
    queryFn: () => adminApi.listShipments(params),
  });
}
