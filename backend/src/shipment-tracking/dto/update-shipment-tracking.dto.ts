
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentTrackingController } from './shipment-tracking.controller';
import { ShipmentTrackingService } from './shipment-tracking.service';
import { TrackingEvent } from './entities/tracking-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrackingEvent])],
  controllers: [ShipmentTrackingController],
  providers: [ShipmentTrackingService],
  exports: [ShipmentTrackingService],
})
export class ShipmentTrackingModule {}