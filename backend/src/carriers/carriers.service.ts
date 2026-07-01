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
    const shipments = await this.shipmentRepo.find({
      where: { carrierId },
      select: ['id', 'status', 'price', 'currency', 'estimatedDeliveryDate', 'actualDeliveryDate'],
    });

    const completed = shipments.filter((s) => s.status === ShipmentStatus.COMPLETED);
    const delivered = shipments.filter(
      (s) => s.status === ShipmentStatus.DELIVERED || s.status === ShipmentStatus.COMPLETED,
    );
    const cancelled = shipments.filter((s) => s.status === ShipmentStatus.CANCELLED);

    const totalAccepted = shipments.filter(
      (s) => s.status !== ShipmentStatus.PENDING,
    ).length;

    const onTimeDeliveries = delivered.filter(
      (s) =>
        s.estimatedDeliveryDate &&
        s.actualDeliveryDate &&
        new Date(s.actualDeliveryDate) <= new Date(s.estimatedDeliveryDate),
    ).length;

    const onTimeRate = delivered.length > 0 ? onTimeDeliveries / delivered.length : 0;

    const totalEarnings = completed.reduce((sum, s) => sum + Number(s.price), 0);

    const cancellationRate = totalAccepted > 0 ? cancelled.length / totalAccepted : 0;

    return {
      totalAccepted,
      totalCompleted: completed.length,
      totalCancelled: cancelled.length,
      onTimeRate: Math.round(onTimeRate * 100) / 100,
      cancellationRate: Math.round(cancellationRate * 100) / 100,
      totalEarnings,
    };
  }
}
