import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { ShipmentAnalyticsService } from './shipment-analytics.service';
import { ShipmentAnalyticsController } from './shipment-analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment])],
  controllers: [ShipmentAnalyticsController],
  providers: [ShipmentAnalyticsService],
})
export class AnalyticsModule {}
