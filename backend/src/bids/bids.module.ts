import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BidsService } from './bids.service';
import { BidsController } from './bids.controller';
import { Bid } from './entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { BidsNotificationsService } from './bids-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Shipment])],
  controllers: [BidsController],
  providers: [BidsService, BidsNotificationsService],
})
export class BidsModule {}
