import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

@Injectable()
export class CarriersService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async getMyMetrics(carrierId: string) {
    const [
      totalAcceptedResult,
      totalCompletedResult,
      totalCancelledResult,
      deliveredCountResult,
      onTimeResult,
      totalEarningsResult,
    ] = await Promise.all([
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('COUNT(*)', 'count')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status != :pending', {
          pending: ShipmentStatus.PENDING,
        })
        .getRawOne<{ count: string }>(),
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('COUNT(*)', 'count')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status = :status', {
          status: ShipmentStatus.COMPLETED,
        })
        .getRawOne<{ count: string }>(),
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('COUNT(*)', 'count')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status = :status', {
          status: ShipmentStatus.CANCELLED,
        })
        .getRawOne<{ count: string }>(),
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('COUNT(*)', 'count')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status IN (:...statuses)', {
          statuses: [ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED],
        })
        .getRawOne<{ count: string }>(),
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('COUNT(*)', 'count')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status IN (:...statuses)', {
          statuses: [ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED],
        })
        .andWhere(
          'shipment.actualDeliveryDate IS NOT NULL AND shipment.estimatedDeliveryDate IS NOT NULL AND shipment.actualDeliveryDate <= shipment.estimatedDeliveryDate',
        )
        .getRawOne<{ count: string }>(),
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('SUM(shipment.price)', 'total')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status = :status', {
          status: ShipmentStatus.COMPLETED,
        })
        .getRawOne<{ total: string | null }>(),
    ]);

    const totalAccepted = Number(totalAcceptedResult?.count ?? '0');
    const totalCompleted = Number(totalCompletedResult?.count ?? '0');
    const totalCancelled = Number(totalCancelledResult?.count ?? '0');
    const delivered = Number(deliveredCountResult?.count ?? '0');
    const onTimeDeliveries = Number(onTimeResult?.count ?? '0');
    const onTimeRate = delivered > 0 ? onTimeDeliveries / delivered : 0;
    const totalEarnings = parseFloat(totalEarningsResult?.total ?? '0');
    const cancellationRate =
      totalAccepted > 0 ? totalCancelled / totalAccepted : 0;

    return {
      totalAccepted,
      totalCompleted,
      totalCancelled,
      onTimeRate: Math.round(onTimeRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      totalEarnings,
    };
  }
}
