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
      carrierCancelledResult,
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
      // Carrier-initiated cancellations only (#1666). A cancellation is the
      // carrier's fault only when the carrier is the one recorded as changing the
      // status; `changedById` in the status history is the shipped record of who
      // cancelled. Counting every cancelled shipment penalised the carrier for
      // cancellations the shipper made, which it cannot prevent or influence.
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('COUNT(*)', 'count')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status = :status', {
          status: ShipmentStatus.CANCELLED,
        })
        .andWhere(
          `EXISTS (
             SELECT 1 FROM shipment_status_history h
             WHERE h.shipment_id = shipment.id
               AND h.to_status = :cancelled
               AND h.changed_by_id = :carrierId
           )`,
          { cancelled: ShipmentStatus.CANCELLED, carrierId },
        )
        .getRawOne<{ count: string }>(),
      // Denominator for the on-time rate: only deliveries that actually had an
      // estimate to be measured against (#1666).
      //
      // `estimatedDeliveryDate` is optional when a shipment is created, so this
      // used to count *every* delivered/completed shipment while the numerator
      // required both dates. A shipment with no estimate was therefore always
      // counted as not on time, dragging a carrier's rate down for shipments
      // that were never given a target in the first place.
      this.shipmentRepo
        .createQueryBuilder('shipment')
        .select('COUNT(*)', 'count')
        .where('shipment.carrierId = :carrierId', { carrierId })
        .andWhere('shipment.status IN (:...statuses)', {
          statuses: [ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED],
        })
        .andWhere('shipment.estimatedDeliveryDate IS NOT NULL')
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
    const carrierCancelled = Number(carrierCancelledResult?.count ?? '0');
    const delivered = Number(deliveredCountResult?.count ?? '0');
    const onTimeDeliveries = Number(onTimeResult?.count ?? '0');
    const onTimeRate = delivered > 0 ? onTimeDeliveries / delivered : 0;
    const totalEarnings = parseFloat(totalEarningsResult?.total ?? '0');
    const cancellationRate =
      totalAccepted > 0 ? carrierCancelled / totalAccepted : 0;

    return {
      totalAccepted,
      totalCompleted,
      /** Cancellations the carrier itself performed (see the query above). */
      totalCancelled: carrierCancelled,
      onTimeRate: Math.round(onTimeRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      totalEarnings,
      // Counts are returned alongside the rates so a UI or an admin decision can
      // see how few deliveries a rate is based on — a 0.0 or 1.0 rate over three
      // shipments is not comparable to the same rate over three hundred.
      onTimeDeliveries,
      deliveriesWithEstimate: delivered,
      carrierCancelledCancellations: carrierCancelled,
    };
  }
}
