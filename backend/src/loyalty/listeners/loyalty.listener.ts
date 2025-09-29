import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LoyaltyService } from '../services/loyalty.service';

@Injectable()
export class LoyaltyEventListener {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @OnEvent('shipment.completed')
  handleShipmentCompletedEvent(payload: { userId: string; shipmentId: string }) {
    this.loyaltyService.awardPointsForShipment(payload.userId);
  }
}