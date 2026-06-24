import { apiClient } from './client';
import type { User, UserRole } from '../../types/auth.types';
import type { Shipment, ShipmentStatus } from '../../types/shipment.types';

export interface PlatformStats {
  users: {
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
  };
  shipments: {
    total: number;
    byStatus: Record<ShipmentStatus, number>;
    disputesPending: number;
  };
  revenue: {
    totalCompleted: number;
    currency: string;
  };
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedAdminShipments {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryUsersParams {
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface QueryAdminShipmentsParams {
  status?: ShipmentStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
}

export const adminApi = {
  getStats(): Promise<PlatformStats> {
    return apiClient<PlatformStats>('/admin/stats');
  },

  listUsers(params: QueryUsersParams = {}): Promise<PaginatedUsers> {
    return apiClient<PaginatedUsers>(`/admin/users${buildQuery(params as Record<string, string | number | boolean | undefined>)}`);
  },

  getUser(id: string): Promise<User> {
    return apiClient<User>(`/admin/users/${id}`);
  },

  deactivateUser(id: string): Promise<User> {
    return apiClient<User>(`/admin/users/${id}/deactivate`, { method: 'PATCH' });
  },

  activateUser(id: string): Promise<User> {
    return apiClient<User>(`/admin/users/${id}/activate`, { method: 'PATCH' });
  },

  changeUserRole(id: string, role: UserRole): Promise<User> {
    return apiClient<User>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  listShipments(params: QueryAdminShipmentsParams = {}): Promise<PaginatedAdminShipments> {
    return apiClient<PaginatedAdminShipments>(
      `/admin/shipments${buildQuery(params as Record<string, string | number | boolean | undefined>)}`,
    );
  },
};
