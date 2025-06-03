import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingSystemService } from './tracking-system.service';
import { TrackingSystemController } from './tracking-system.controller';
import { Shipment, ShipmentStatusHistory } from './entities/shipment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory, Location]),
  ],
  controllers: [TrackingSystemController],
  providers: [TrackingSystemService],
})
export class TrackingSystemModule {}
