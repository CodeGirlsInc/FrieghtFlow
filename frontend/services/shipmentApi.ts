import { shipmentApi as shipmentApiClient } from '../lib/api/shipment.api';
import type { PaginatedShipments } from '../types/shipment.types';

export const shipmentApi = {
  async marketplace(params?: {
    origin?: string;
    destination?: string;
    page?: number;
  }): Promise<PaginatedShipments> {
    return shipmentApiClient.marketplace(params);
  },
};
