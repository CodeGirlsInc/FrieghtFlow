import { User } from './auth.types';

export enum ShipmentStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  shipperId: string;
  shipper: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  carrierId: string | null;
  carrier: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> | null;
  origin: string;
  destination: string;
  cargoDescription: string;
  weightKg: number;
  volumeCbm: number | null;
  price: number;
  currency: string;
  status: ShipmentStatus;
  notes: string | null;
  pickupDate: string | null;
  estimatedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentStatusHistory {
  id: string;
  shipmentId: string;
  fromStatus: ShipmentStatus | null;
  toStatus: ShipmentStatus;
  changedById: string;
  changedBy: Pick<User, 'id' | 'firstName' | 'lastName'>;
  reason: string | null;
  changedAt: string;
}

export interface CreateShipmentPayload {
  origin: string;
  destination: string;
  cargoDescription: string;
  weightKg: number;
  volumeCbm?: number;
  price: number;
  currency?: string;
  notes?: string;
  pickupDate?: string;
  estimatedDeliveryDate?: string;
}

export interface QueryShipmentParams {
  status?: ShipmentStatus;
  origin?: string;
  destination?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedShipments {
  data: Shipment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
