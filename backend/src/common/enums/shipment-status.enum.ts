export enum ShipmentStatus {
  PENDING = 'pending', // Created by shipper, waiting for carrier
  ACCEPTED = 'accepted', // Carrier accepted the job
  IN_TRANSIT = 'in_transit', // Carrier picked up cargo
  DELIVERED = 'delivered', // Carrier marked as delivered
  COMPLETED = 'completed', // Shipper confirmed delivery
  CANCELLED = 'cancelled', // Cancelled by shipper or carrier
  DISPUTED = 'disputed', // Under dispute resolution
}
