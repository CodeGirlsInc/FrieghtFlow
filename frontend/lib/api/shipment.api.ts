import { apiClient } from './client';
import {
  Shipment,
  ShipmentStatusHistory,
  CreateShipmentPayload,
  QueryShipmentParams,
  PaginatedShipments,
  ShipmentStatus,
} from '../../types/shipment.types';

function buildQuery(params: QueryShipmentParams): string {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.origin) q.set('origin', params.origin);
  if (params.destination) q.set('destination', params.destination);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const str = q.toString();
  return str ? `?${str}` : '';
}

export const shipmentApi = {
  create(payload: CreateShipmentPayload): Promise<Shipment> {
    return apiClient('/shipments', { method: 'POST', body: JSON.stringify(payload) });
  },

  list(params: QueryShipmentParams = {}): Promise<PaginatedShipments> {
    return apiClient(`/shipments${buildQuery(params)}`);
  },

  marketplace(params: QueryShipmentParams = {}): Promise<PaginatedShipments> {
    return apiClient(`/shipments/marketplace${buildQuery(params)}`);
  },

  getById(id: string): Promise<Shipment> {
    return apiClient(`/shipments/${id}`);
  },

  track(trackingNumber: string): Promise<Shipment> {
    return apiClient(`/shipments/track/${trackingNumber}`);
  },

  getHistory(id: string): Promise<ShipmentStatusHistory[]> {
    return apiClient(`/shipments/${id}/history`);
  },

  accept(id: string): Promise<Shipment> {
    return apiClient(`/shipments/${id}/accept`, { method: 'PATCH' });
  },

  pickup(id: string): Promise<Shipment> {
    return apiClient(`/shipments/${id}/pickup`, { method: 'PATCH' });
  },

  markDelivered(id: string): Promise<Shipment> {
    return apiClient(`/shipments/${id}/deliver`, { method: 'PATCH' });
  },

  confirmDelivery(id: string): Promise<Shipment> {
    return apiClient(`/shipments/${id}/confirm-delivery`, { method: 'PATCH' });
  },

  cancel(id: string, reason?: string): Promise<Shipment> {
    return apiClient(`/shipments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  raiseDispute(id: string, reason: string): Promise<Shipment> {
    return apiClient(`/shipments/${id}/dispute`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  resolveDispute(
    id: string,
    resolution: ShipmentStatus.COMPLETED | ShipmentStatus.CANCELLED,
    reason: string,
  ): Promise<Shipment> {
    return apiClient(`/shipments/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ resolution, reason }),
    });
  },
};
