import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentExportService } from './shipment-export.service';
import { ShipmentExportController } from './shipment-export.controller';

/**
 * ShipmentExportModule
 *
 * Provides GET /api/shipments/export/csv with date range and status filters.
 * Register this module in your AppModule and pass the Shipment entity via
 * TypeOrmModule.forFeature([Shipment]).
 */
@Module({
  imports: [TypeOrmModule.forFeature([], 'default')],
  controllers: [ShipmentExportController],
  providers: [ShipmentExportService],
  exports: [ShipmentExportService],
})
export class ShipmentExportModule {}
