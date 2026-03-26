import { Shipment } from '../entities/shipment.entity';

export const SHIPMENT_CREATED = 'shipment.created';
export const SHIPMENT_ACCEPTED = 'shipment.accepted';
export const SHIPMENT_IN_TRANSIT = 'shipment.in_transit';
export const SHIPMENT_DELIVERED = 'shipment.delivered';
export const SHIPMENT_COMPLETED = 'shipment.completed';
export const SHIPMENT_CANCELLED = 'shipment.cancelled';
export const SHIPMENT_DISPUTED = 'shipment.disputed';
export const SHIPMENT_DISPUTE_RESOLVED = 'shipment.dispute_resolved';

/**
 * Base event payload carried on every shipment domain event.
 * The shipment is always loaded with shipper + carrier relations.
 */
export class ShipmentEvent {
  constructor(
    public readonly shipment: Shipment,
    public readonly actorId: string,
    public readonly reason?: string,
  ) {}
}
