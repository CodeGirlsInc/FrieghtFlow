import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  SHIPMENT_CREATED,
  SHIPMENT_IN_TRANSIT,
  SHIPMENT_DELIVERED,
  SHIPMENT_COMPLETED,
  SHIPMENT_CANCELLED,
  SHIPMENT_DISPUTED,
  SHIPMENT_DISPUTE_RESOLVED,
  ShipmentEvent,
} from '../shipments/events/shipment.events';
import { BidEmailEvent } from './events/bid-email.events';
import { MailService } from './mail.service';

@Injectable()
export class EmailEventListener {
  private readonly logger = new Logger(EmailEventListener.name);

  constructor(
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get frontendUrl(): string {
    return this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
  }

  private async unsubscribeUrl(
    userId: string,
    eventType: string,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(
      { userId, eventType },
      { expiresIn: '30d' },
    );
    return `${this.frontendUrl}/notifications/unsubscribe?token=${token}`;
  }

  @OnEvent(SHIPMENT_CREATED)
  async onShipmentCreated(event: ShipmentEvent): Promise<void> {
    const { shipper, trackingNumber, origin, destination, id } = event.shipment;
    if (!shipper) return;
    this.mailService.sendAsync(
      shipper.email,
      'Your shipment has been posted',
      'shipment-created',
      {
        recipientName: `${shipper.firstName} ${shipper.lastName}`,
        trackingNumber,
        origin,
        destination,
        ctaUrl: `${this.frontendUrl}/shipments/${id}`,
        ctaLabel: 'View Shipment',
        unsubscribeUrl: await this.unsubscribeUrl(
          shipper.id,
          'shipment-created',
        ),
      },
    );
  }

  @OnEvent(SHIPMENT_IN_TRANSIT)
  async onShipmentInTransit(event: ShipmentEvent): Promise<void> {
    const { shipper, trackingNumber, origin, destination, id } = event.shipment;
    if (!shipper) return;
    this.mailService.sendAsync(
      shipper.email,
      'Your shipment is on its way',
      'shipment-in-transit',
      {
        recipientName: `${shipper.firstName} ${shipper.lastName}`,
        trackingNumber,
        origin,
        destination,
        ctaUrl: `${this.frontendUrl}/shipments/${id}`,
        ctaLabel: 'Track Shipment',
        unsubscribeUrl: await this.unsubscribeUrl(
          shipper.id,
          'shipment-in-transit',
        ),
      },
    );
  }

  @OnEvent(SHIPMENT_DELIVERED)
  async onShipmentDelivered(event: ShipmentEvent): Promise<void> {
    const { shipper, trackingNumber, origin, destination, id } = event.shipment;
    if (!shipper) return;
    this.mailService.sendAsync(
      shipper.email,
      'Your shipment has been delivered',
      'shipment-delivered',
      {
        recipientName: `${shipper.firstName} ${shipper.lastName}`,
        trackingNumber,
        origin,
        destination,
        ctaUrl: `${this.frontendUrl}/shipments/${id}`,
        ctaLabel: 'Confirm Delivery',
        unsubscribeUrl: await this.unsubscribeUrl(
          shipper.id,
          'shipment-delivered',
        ),
      },
    );
  }

  @OnEvent(SHIPMENT_COMPLETED)
  async onDeliveryConfirmed(event: ShipmentEvent): Promise<void> {
    const { carrier, trackingNumber, origin, destination, id } = event.shipment;
    if (!carrier) return;
    this.mailService.sendAsync(
      carrier.email,
      'Delivery confirmed — payment released',
      'delivery-confirmed',
      {
        recipientName: `${carrier.firstName} ${carrier.lastName}`,
        trackingNumber,
        origin,
        destination,
        ctaUrl: `${this.frontendUrl}/shipments/${id}`,
        ctaLabel: 'View Details',
        unsubscribeUrl: await this.unsubscribeUrl(
          carrier.id,
          'delivery-confirmed',
        ),
      },
    );
  }

  @OnEvent(SHIPMENT_CANCELLED)
  async onShipmentCancelled(event: ShipmentEvent): Promise<void> {
    const { shipper, carrier, trackingNumber, origin, destination, id } =
      event.shipment;
    const ctx = {
      trackingNumber,
      origin,
      destination,
      ctaUrl: `${this.frontendUrl}/shipments/${id}`,
      ctaLabel: 'View Shipments',
    };

    if (shipper) {
      this.mailService.sendAsync(
        shipper.email,
        'Your shipment has been cancelled',
        'shipment-cancelled',
        {
          ...ctx,
          recipientName: `${shipper.firstName} ${shipper.lastName}`,
          unsubscribeUrl: await this.unsubscribeUrl(
            shipper.id,
            'shipment-cancelled',
          ),
        },
      );
    }
    if (carrier) {
      this.mailService.sendAsync(
        carrier.email,
        'Your shipment has been cancelled',
        'shipment-cancelled',
        {
          ...ctx,
          recipientName: `${carrier.firstName} ${carrier.lastName}`,
          unsubscribeUrl: await this.unsubscribeUrl(
            carrier.id,
            'shipment-cancelled',
          ),
        },
      );
    }
  }

  @OnEvent(SHIPMENT_DISPUTED)
  async onDisputeOpened(event: ShipmentEvent): Promise<void> {
    const { shipper, carrier, trackingNumber, origin, destination, id } =
      event.shipment;
    const ctx = {
      trackingNumber,
      origin,
      destination,
      ctaUrl: `${this.frontendUrl}/shipments/${id}`,
      ctaLabel: 'View Dispute',
    };

    if (shipper) {
      this.mailService.sendAsync(
        shipper.email,
        'A dispute has been raised',
        'dispute-opened',
        {
          ...ctx,
          recipientName: `${shipper.firstName} ${shipper.lastName}`,
          unsubscribeUrl: await this.unsubscribeUrl(
            shipper.id,
            'dispute-opened',
          ),
        },
      );
    }
    if (carrier) {
      this.mailService.sendAsync(
        carrier.email,
        'A dispute has been raised',
        'dispute-opened',
        {
          ...ctx,
          recipientName: `${carrier.firstName} ${carrier.lastName}`,
          unsubscribeUrl: await this.unsubscribeUrl(
            carrier.id,
            'dispute-opened',
          ),
        },
      );
    }
  }

  @OnEvent(SHIPMENT_DISPUTE_RESOLVED)
  async onDisputeResolved(event: ShipmentEvent): Promise<void> {
    const { shipper, carrier, trackingNumber, origin, destination, id } =
      event.shipment;
    const ctx = {
      trackingNumber,
      origin,
      destination,
      ctaUrl: `${this.frontendUrl}/shipments/${id}`,
      ctaLabel: 'View Resolution',
    };

    if (shipper) {
      this.mailService.sendAsync(
        shipper.email,
        'Your dispute has been resolved',
        'dispute-resolved',
        {
          ...ctx,
          recipientName: `${shipper.firstName} ${shipper.lastName}`,
          unsubscribeUrl: await this.unsubscribeUrl(
            shipper.id,
            'dispute-resolved',
          ),
        },
      );
    }
    if (carrier) {
      this.mailService.sendAsync(
        carrier.email,
        'Your dispute has been resolved',
        'dispute-resolved',
        {
          ...ctx,
          recipientName: `${carrier.firstName} ${carrier.lastName}`,
          unsubscribeUrl: await this.unsubscribeUrl(
            carrier.id,
            'dispute-resolved',
          ),
        },
      );
    }
  }

  @OnEvent('bid.received')
  async onBidReceived(event: BidEmailEvent): Promise<void> {
    const {
      shipperEmail,
      shipperName,
      trackingNumber,
      origin,
      destination,
      shipperId,
      shipmentId,
    } = event;
    this.mailService.sendAsync(
      shipperEmail,
      'You have a new bid on your shipment',
      'bid-received',
      {
        recipientName: shipperName,
        trackingNumber,
        origin,
        destination,
        ctaUrl: `${this.frontendUrl}/shipments/${shipmentId}/bids`,
        ctaLabel: 'View Bids',
        unsubscribeUrl: await this.unsubscribeUrl(shipperId, 'bid-received'),
      },
    );
  }

  @OnEvent('bid.accepted')
  async onBidAccepted(event: BidEmailEvent): Promise<void> {
    const {
      carrierEmail,
      carrierName,
      trackingNumber,
      origin,
      destination,
      carrierId,
      shipmentId,
    } = event;
    if (!carrierEmail || !carrierName || !carrierId) return;
    this.mailService.sendAsync(
      carrierEmail,
      'Your bid was accepted',
      'bid-accepted',
      {
        recipientName: carrierName,
        trackingNumber,
        origin,
        destination,
        ctaUrl: `${this.frontendUrl}/shipments/${shipmentId}`,
        ctaLabel: 'View Shipment',
        unsubscribeUrl: await this.unsubscribeUrl(carrierId, 'bid-accepted'),
      },
    );
  }
}
