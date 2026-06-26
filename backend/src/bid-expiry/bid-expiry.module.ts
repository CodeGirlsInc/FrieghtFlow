import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from '../bids/entities/bid.entity';
import { BidExpiryService } from './bid-expiry.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid])],
  providers: [BidExpiryService],
})
export class BidExpiryModule {}
