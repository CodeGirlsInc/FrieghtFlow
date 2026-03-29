import { apiClient } from './client';
import { User } from '../../types/auth.types';
import { PaginatedShipments, ShipmentStatus } from '../../types/shipment.types';

export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminStatsResponse {
  users: {
    total: number;
    byRole: {
      admin: number;
      shipper: number;
      carrier: number;
    };
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

export const adminApi = {
  getStats: async (): Promise<AdminStatsResponse> => {
    return apiClient<AdminStatsResponse>('/admin/stats');
  },

  listUsers: async (page = 1, role?: string, status?: string): Promise<ListUsersResponse> => {
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('limit', '10');
    if (role && role !== 'All Roles') {
      // Map 'Shippers' -> 'shipper', etc
      let roleVal = role.toLowerCase();
      if (roleVal.endsWith('s')) roleVal = roleVal.slice(0, -1);
      query.append('role', roleVal);
    }
    if (status && status !== 'All') {
      query.append('isActive', status === 'Active' ? 'true' : 'false');
    }
    return apiClient<ListUsersResponse>(`/admin/users?${query.toString()}`);
  },

  listShipments: async (page = 1, status?: string): Promise<PaginatedShipments> => {
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('limit', '10');
    if (status && status !== 'All') {
      // Map visual tabs to ShipmentStatus enum
      const statusMap: Record<string, ShipmentStatus> = {
        'Pending': ShipmentStatus.PENDING,
        'Accepted': ShipmentStatus.ACCEPTED,
        'In Transit': ShipmentStatus.IN_TRANSIT,
        'Delivered': ShipmentStatus.DELIVERED,
        'Completed': ShipmentStatus.COMPLETED,
        'Cancelled': ShipmentStatus.CANCELLED,
        'Disputed': ShipmentStatus.DISPUTED,
      };
      if (statusMap[status]) {
        query.append('status', statusMap[status]);
      }
    }
    return apiClient<PaginatedShipments>(`/admin/shipments?${query.toString()}`);
  },

  activateUser: async (id: string): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}/activate`, { method: 'POST' });
  },

  deactivateUser: async (id: string): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}/deactivate`, { method: 'POST' });
  },

  changeUserRole: async (id: string, role: string): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },
};
