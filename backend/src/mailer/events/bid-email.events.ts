export class BidEmailEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly trackingNumber: string,
    public readonly origin: string,
    public readonly destination: string,
    public readonly shipperEmail: string,
    public readonly shipperName: string,
    public readonly shipperId: string,
    public readonly carrierEmail?: string,
    public readonly carrierName?: string,
    public readonly carrierId?: string,
  ) {}
}
