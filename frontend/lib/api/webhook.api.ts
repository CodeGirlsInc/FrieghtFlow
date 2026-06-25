import { apiClient } from './client';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  createdAt: string;
  lastDeliveryStatus: 'never' | 'success' | 'failed' | null;
}

export interface RegisterWebhookPayload {
  url: string;
  events: string[];
}

export interface TestPingResult {
  delivered: boolean;
  statusCode: number;
  responseTimeMs: number;
}

export const WEBHOOK_EVENTS = [
  'shipment_created',
  'shipment_accepted',
  'shipment_in_transit',
  'shipment_delivered',
  'shipment_completed',
  'shipment_cancelled',
  'shipment_disputed',
] as const;

export const webhookApi = {
  list(): Promise<Webhook[]> {
    return apiClient('/webhooks');
  },

  register(payload: RegisterWebhookPayload): Promise<Webhook> {
    return apiClient('/webhooks', { method: 'POST', body: JSON.stringify(payload) });
  },

  delete(id: string): Promise<void> {
    return apiClient(`/webhooks/${id}`, { method: 'DELETE' });
  },

  testPing(id: string): Promise<TestPingResult> {
    return apiClient(`/webhooks/${id}/test`, { method: 'POST' });
  },

  getSecret(id: string): Promise<{ secret: string }> {
    return apiClient(`/webhooks/${id}/secret`);
  },
};
