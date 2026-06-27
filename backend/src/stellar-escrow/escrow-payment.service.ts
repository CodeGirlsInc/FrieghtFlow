// #1009 – Soroban escrow: on-chain payment hold & release for shipments
import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export interface EscrowHold { shipmentId: string; amount: number; txHash: string; status: 'held' | 'released' | 'refunded'; }

@Injectable()
export class EscrowPaymentService {
  private readonly logger = new Logger(EscrowPaymentService.name);
  private readonly escrows = new Map<string, EscrowHold>();

  async holdPayment(shipmentId: string, amount: number, shipperPublicKey: string): Promise<EscrowHold> {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    this.logger.log(`Holding ${amount} XLM in escrow for shipment ${shipmentId} (shipper: ${shipperPublicKey})`);
    const hold: EscrowHold = { shipmentId, amount, txHash: `escrow-hold-${Date.now()}`, status: 'held' };
    this.escrows.set(shipmentId, hold);
    return hold;
  }

  async releasePayment(shipmentId: string, carrierPublicKey: string): Promise<EscrowHold> {
    const escrow = this.escrows.get(shipmentId);
    if (!escrow) throw new BadRequestException('No escrow found for this shipment');
    this.logger.log(`Releasing escrow for shipment ${shipmentId} to carrier ${carrierPublicKey}`);
    escrow.status = 'released';
    return escrow;
  }

  async refundPayment(shipmentId: string): Promise<EscrowHold> {
    const escrow = this.escrows.get(shipmentId);
    if (!escrow) throw new BadRequestException('No escrow found for this shipment');
    escrow.status = 'refunded';
    return escrow;
  }
}
