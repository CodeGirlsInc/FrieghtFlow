import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Bid, BidStatus } from '../bids/entities/bid.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BidExpiryService {
  private readonly logger = new Logger(BidExpiryService.name);

  constructor(
    @InjectRepository(Bid) private readonly bidRepo: Repository<Bid>,
    private readonly configService: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async expireStaleBids(): Promise<void> {
    const expiryHours =
      this.configService.get<number>('BID_EXPIRY_HOURS') ?? 72;
    const threshold = new Date(Date.now() - expiryHours * 3600_000);

    const result = await this.bidRepo.update(
      { status: BidStatus.PENDING, createdAt: LessThan(threshold) },
      { status: BidStatus.EXPIRED },
    );

    this.logger.log(`Expired ${result.affected ?? 0} stale bids`);
  }
}
