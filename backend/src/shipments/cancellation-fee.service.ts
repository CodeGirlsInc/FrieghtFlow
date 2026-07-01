import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

const FEE_TIERS: Partial<Record<ShipmentStatus, number>> = {
  [ShipmentStatus.PENDING]: 0,
  [ShipmentStatus.ACCEPTED]: 0.1,
  [ShipmentStatus.IN_TRANSIT]: 0.25,
};

const CANCELLABLE = new Set<ShipmentStatus>([
  ShipmentStatus.PENDING,
  ShipmentStatus.ACCEPTED,
  ShipmentStatus.IN_TRANSIT,
]);

export interface CancellationResult {
  shipmentId: string;
  cancellationFee: number;
  currency: string;
  status: ShipmentStatus.CANCELLED;
}

@Injectable()
export class CancellationFeeService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  calculateFee(price: number, status: ShipmentStatus): number {
    const rate = FEE_TIERS[status] ?? null;
    if (rate === null) throw new BadRequestException(`Shipment in status "${status}" cannot be cancelled`);
    return Math.round(price * rate * 100) / 100;
  }

  async cancelShipment(shipmentId: string): Promise<CancellationResult> {
    const shipment = await this.shipmentRepo.findOneOrFail({ where: { id: shipmentId } });

    if (!CANCELLABLE.has(shipment.status)) {
      throw new BadRequestException(`Cannot cancel a shipment with status "${shipment.status}"`);
    }

    const cancellationFee = this.calculateFee(Number(shipment.price), shipment.status);

    await this.shipmentRepo.update(shipmentId, {
      status: ShipmentStatus.CANCELLED,
      notes: `Cancellation fee: ${cancellationFee} ${shipment.currency}`,
    });

    return {
      shipmentId,
      cancellationFee,
      currency: shipment.currency,
      status: ShipmentStatus.CANCELLED,
    };
  }
}
