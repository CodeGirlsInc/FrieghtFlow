export type UserRole = 'shipper' | 'carrier';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  origin: string;
  destination: string;
  date: string;
}

// Mocked data
const mockShipments: Shipment[] = [
  { id: '1', trackingNumber: 'TRK-001', status: 'in_transit', origin: 'New York, NY', destination: 'Los Angeles, CA', date: '2024-03-01' },
  { id: '2', trackingNumber: 'TRK-002', status: 'pending', origin: 'Chicago, IL', destination: 'Miami, FL', date: '2024-03-05' },
  { id: '3', trackingNumber: 'TRK-003', status: 'completed', origin: 'Seattle, WA', destination: 'Denver, CO', date: '2024-02-28' },
  { id: '4', trackingNumber: 'TRK-004', status: 'in_transit', origin: 'Austin, TX', destination: 'Boston, MA', date: '2024-03-10' },
  { id: '5', trackingNumber: 'TRK-005', status: 'pending', origin: 'Atlanta, GA', destination: 'Philadelphia, PA', date: '2024-03-12' },
];

export const shipmentApi = {
  list: async (params?: { status?: Shipment['status']; limit?: number }): Promise<Shipment[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let result = [...mockShipments];
    
    if (params?.status) {
      result = result.filter(s => s.status === params.status);
    }
    
    if (params?.limit) {
      result = result.slice(0, params.limit);
    }
    
    return result;
  }
};
