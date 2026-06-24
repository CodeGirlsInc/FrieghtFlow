import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  SHIPMENT_ACCEPTED,
  SHIPMENT_CANCELLED,
  SHIPMENT_COMPLETED,
  SHIPMENT_DELIVERED,
  SHIPMENT_DISPUTED,
  SHIPMENT_DISPUTE_RESOLVED,
  SHIPMENT_IN_TRANSIT,
  ShipmentEvent,
} from '../shipments/events/shipment.events';
import { WebhooksService } from './webhooks.service';

@Injectable()
export class WebhookDeliveryListener {
  constructor(private readonly webhooksService: WebhooksService) {}

  @OnEvent(SHIPMENT_ACCEPTED)
  @OnEvent(SHIPMENT_IN_TRANSIT)
  @OnEvent(SHIPMENT_DELIVERED)
  @OnEvent(SHIPMENT_COMPLETED)
  @OnEvent(SHIPMENT_CANCELLED)
  @OnEvent(SHIPMENT_DISPUTED)
  @OnEvent(SHIPMENT_DISPUTE_RESOLVED)
  async handleShipmentStatusChanged(event: ShipmentEvent): Promise<void> {
    await this.webhooksService.deliverShipmentStatusChange(event);
  }
}
