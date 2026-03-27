import { apiClient } from './client';
import { User } from '../../types/auth.types';

export interface ListUsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminApi = {
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
