import { apiClient } from "./client";
import { User, UserRole } from "@/types/auth.types";
import { Shipment, ShipmentStatus } from "@/types/shipment.types";

// Stats overview interface
export interface PlatformStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    shippers: number;
    carriers: number;
    admins: number;
  };
  shipments: {
    total: number;
    pending: number;
    inTransit: number;
    completed: number;
    disputed: number;
    cancelled: number;
  };
  revenue: {
    completed: number;
  };
}

// Paginated users
export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  pageSize: number;
}

// Paginated shipments
export interface PaginatedAdminShipments {
  data: Shipment[];
  total: number;
  page: number;
  pageSize: number;
}

// Query params for users
export interface QueryUsersParams {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  status?: "active" | "inactive";
}

// Query params for shipments
export interface QueryAdminShipmentsParams {
  page?: number;
  pageSize?: number;
  status?: ShipmentStatus;
  disputed?: boolean;
}

// Helper to serialize query params
function toQueryString(params: Record<string, any> = {}): string {
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return query ? `?${query}` : "";
}

// Admin API client
export const adminApi = {
  async getStats(): Promise<PlatformStats> {
    return apiClient.get("/admin/stats");
  },

  async listUsers(params?: QueryUsersParams): Promise<PaginatedUsers> {
    const qs = toQueryString(params || {});
    return apiClient.get(`/admin/users${qs}`);
  },

  async getUser(id: string): Promise<User> {
    return apiClient.get(`/admin/users/${id}`);
  },

  async deactivateUser(id: string): Promise<void> {
    return apiClient.post(`/admin/users/${id}/deactivate`);
  },

  async activateUser(id: string): Promise<void> {
    return apiClient.post(`/admin/users/${id}/activate`);
  },

  async changeUserRole(id: string, role: UserRole): Promise<void> {
    return apiClient.post(`/admin/users/${id}/role`, { role });
  },

  async listShipments(params?: QueryAdminShipmentsParams): Promise<PaginatedAdminShipments> {
    const qs = toQueryString(params || {});
    return apiClient.get(`/admin/shipments${qs}`);
  },
};
