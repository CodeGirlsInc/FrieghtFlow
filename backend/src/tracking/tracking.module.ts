import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingEvent } from './tracking-event.entity';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { Shipment } from '../shipment/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingEvent, Shipment])],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
