export type UserRole = 'shipper' | 'carrier' | 'admin';

export type ShipmentStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'completed' | 'cancelled';

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
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
  { id: '6', trackingNumber: 'TRK-006', status: 'accepted', origin: 'Dallas, TX', destination: 'Phoenix, AZ', date: '2024-03-08' },
  { id: '7', trackingNumber: 'TRK-007', status: 'delivered', origin: 'Houston, TX', destination: 'San Diego, CA', date: '2024-03-03' },
];

export const shipmentApi = {
  list: async (params?: { status?: ShipmentStatus; limit?: number }): Promise<Shipment[]> => {
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
