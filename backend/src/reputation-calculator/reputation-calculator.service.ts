import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../reviews/entities/review.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';

@Injectable()
export class ReputationCalculatorService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async calculateScore(carrierId: string) {
    const reviews = await this.reviewRepo.find({
      where: { revieweeId: carrierId },
    });
    const shipments = await this.shipmentRepo.find({ where: { carrierId } });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const onTimeCount = shipments.filter(
      (s) =>
        s.actualDeliveryDate &&
        s.estimatedDeliveryDate &&
        s.actualDeliveryDate <= s.estimatedDeliveryDate,
    ).length;
    const onTimePct = shipments.length > 0 ? onTimeCount / shipments.length : 0;

    const completedCount = shipments.filter(
      (s) =>
        s.status === ShipmentStatus.COMPLETED ||
        s.status === ShipmentStatus.DELIVERED,
    ).length;
    const completionRate =
      shipments.length > 0 ? completedCount / shipments.length : 0;

    const ratingComponent = (avgRating / 5) * 500;
    const punctualityComponent = onTimePct * 300;
    const reliabilityComponent = completionRate * 200;
    const compositeScore = Math.min(
      ratingComponent + punctualityComponent + reliabilityComponent,
      1000,
    );

    return {
      ratingComponent: Math.round(ratingComponent),
      punctualityComponent: Math.round(punctualityComponent * 100) / 100,
      reliabilityComponent: Math.round(reliabilityComponent * 100) / 100,
      compositeScore: Math.round(compositeScore),
    };
  }
}
