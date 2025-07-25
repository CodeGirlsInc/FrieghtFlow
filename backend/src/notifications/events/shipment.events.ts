export class ShipmentCreatedEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly trackingNumber: string,
    public readonly recipientId: string,
    public readonly recipientEmail: string,
    public readonly recipientName: string,
    public readonly origin: string,
    public readonly destination: string,
    public readonly estimatedDelivery: Date,
    public readonly items: Array<{
      name: string;
      quantity: number;
      value: number;
    }>,
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class ShipmentDeliveredEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly trackingNumber: string,
    public readonly recipientId: string,
    public readonly recipientEmail: string,
    public readonly recipientName: string,
    public readonly deliveredAt: Date,
    public readonly deliveryLocation: string,
    public readonly signedBy?: string,
    public readonly deliveryNotes?: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class ShipmentDelayedEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly trackingNumber: string,
    public readonly recipientId: string,
    public readonly recipientEmail: string,
    public readonly recipientName: string,
    public readonly originalDelivery: Date,
    public readonly newEstimatedDelivery: Date,
    public readonly delayReason: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class ShipmentCancelledEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly trackingNumber: string,
    public readonly recipientId: string,
    public readonly recipientEmail: string,
    public readonly recipientName: string,
    public readonly cancellationReason: string,
    public readonly refundAmount?: number,
    public readonly metadata?: Record<string, any>,
  ) {}
}
