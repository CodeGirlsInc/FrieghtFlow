import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async create(shipmentId: string, reviewer: User, dto: CreateReviewDto): Promise<Review> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) throw new BadRequestException('Shipment not found');

    if (shipment.status !== ShipmentStatus.COMPLETED) {
      throw new BadRequestException('Reviews can only be left for completed shipments');
    }

    const isShipper = shipment.shipperId === reviewer.id;
    const isCarrier = shipment.carrierId === reviewer.id;
    if (!isShipper && !isCarrier) {
      throw new ForbiddenException('Only parties to the shipment can leave a review');
    }

    const existing = await this.reviewRepo.findOne({
      where: { shipmentId, reviewerId: reviewer.id },
    });
    if (existing) throw new ConflictException('You have already reviewed this shipment');

    // Shipper reviews carrier, carrier reviews shipper
    const revieweeId = isShipper ? shipment.carrierId! : shipment.shipperId;

    const review = this.reviewRepo.create({
      shipmentId,
      reviewerId: reviewer.id,
      revieweeId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    return this.reviewRepo.save(review);
  }

  async getAverageRating(userId: string): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .where('r.reviewee_id = :userId', { userId })
      .select('AVG(CAST(r.rating AS numeric))', 'avg')
      .addSelect('COUNT(*)', 'count')
      .getRawOne<{ avg: string | null; count: string }>();

    return {
      averageRating: result?.avg ? Math.round(Number(result.avg) * 100) / 100 : 0,
      totalReviews: Number(result?.count ?? 0),
    };
  }
}
