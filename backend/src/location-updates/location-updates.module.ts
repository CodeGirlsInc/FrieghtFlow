import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { LocationUpdatesService } from './location-updates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Shipment])],
  providers: [LocationUpdatesService],
  exports: [LocationUpdatesService],
})
export class LocationUpdatesModule {}
