import axios from 'axios';

interface MarketplaceResponse {
  data: Shipment[];
  totalPages: number;
  totalCount: number;
}

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  weight?: number;
  price?: number;
  pickupDate?: string;
}

export const shipmentApi = {
  async marketplace(params?: { origin?: string; destination?: string; page?: number }): Promise<MarketplaceResponse> {
    const response = await axios.get('/api/shipments/marketplace', {
      params,
    });
    return response.data;
  },
};
