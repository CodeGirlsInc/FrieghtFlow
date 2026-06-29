import { apiClient } from './client';

export type BidStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'COUNTER_OFFERED'
  | 'COUNTER_ACCEPTED'
  | 'COUNTER_REJECTED'
  | 'EXPIRED';

export interface Bid {
  id: string;
  shipmentId: string;
  carrierId: string;
  carrier: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    rating?: number;
  };
  proposedPrice: number;
  counterPrice?: number;
  message?: string;
  status: BidStatus;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  shipment?: {
    id: string;
    trackingNumber: string;
    origin: string;
    destination: string;
    price: number;
    currency: string;
  };
}

export interface SubmitBidPayload {
  proposedPrice: number;
  message?: string;
  expiresAt?: string;
}

export interface CounterBidPayload {
  counterPrice: number;
  message?: string;
}

export const bidApi = {
  listBids(shipmentId: string): Promise<Bid[]> {
    return apiClient(`/shipments/${shipmentId}/bids`);
  },

  listMyBids(): Promise<Bid[]> {
    return apiClient('/bids/my');
  },

  submitBid(shipmentId: string, payload: SubmitBidPayload): Promise<Bid> {
    return apiClient(`/shipments/${shipmentId}/bids`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  acceptBid(shipmentId: string, bidId: string): Promise<Bid> {
    return apiClient(`/shipments/${shipmentId}/bids/${bidId}/accept`, { method: 'PATCH' });
  },

  rejectBid(shipmentId: string, bidId: string): Promise<Bid> {
    return apiClient(`/shipments/${shipmentId}/bids/${bidId}/reject`, { method: 'PATCH' });
  },

  counterBid(shipmentId: string, bidId: string, payload: CounterBidPayload): Promise<Bid> {
    return apiClient(`/shipments/${shipmentId}/bids/${bidId}/counter`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  acceptCounter(shipmentId: string, bidId: string): Promise<Bid> {
    return apiClient(`/shipments/${shipmentId}/bids/${bidId}/accept-counter`, { method: 'PATCH' });
  },

  declineCounter(shipmentId: string, bidId: string): Promise<Bid> {
    return apiClient(`/shipments/${shipmentId}/bids/${bidId}/decline-counter`, { method: 'PATCH' });
  },
};
