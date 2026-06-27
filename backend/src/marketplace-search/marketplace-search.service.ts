import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { SearchMarketplaceDto } from './dto/search-marketplace.dto';

@Injectable()
export class MarketplaceSearchService {
  constructor(
    @InjectRepository(Shipment) private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async search(query: SearchMarketplaceDto) {
    const { origin, destination, minPrice, maxPrice, maxWeightKg, cargoCategory, postedWithinHours, page = 1, limit = 20, sortBy = 'postedAt' } = query;
    const skip = (page - 1) * limit;

    const qb = this.shipmentRepo.createQueryBuilder('s')
      .where('s.status = :status', { status: ShipmentStatus.PENDING });

    if (origin) qb.andWhere('s.origin ILIKE :origin', { origin: `%${origin}%` });
    if (destination) qb.andWhere('s.destination ILIKE :destination', { destination: `%${destination}%` });
    if (minPrice !== undefined) qb.andWhere('s.price >= :minPrice', { minPrice });
    if (maxPrice !== undefined) qb.andWhere('s.price <= :maxPrice', { maxPrice });
    if (maxWeightKg !== undefined) qb.andWhere('s.weightKg <= :maxWeightKg', { maxWeightKg });
    if (cargoCategory) qb.andWhere('s.cargoCategory = :cargoCategory', { cargoCategory });
    if (postedWithinHours) {
      const since = new Date(Date.now() - postedWithinHours * 3600_000);
      qb.andWhere('s.createdAt >= :since', { since });
    }

    const sortMap: Record<string, string> = { price: 's.price', weight: 's.weightKg', postedAt: 's.createdAt' };
    qb.orderBy(sortMap[sortBy] ?? 's.createdAt', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
