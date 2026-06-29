import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { Bid } from './entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Shipment, User])],
  controllers: [BidsController],
  providers: [BidsService],
})
export class BidsModule {}
