import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { QuotesController } from './quotes.controller';
import { EtaService } from './eta.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory])],
  controllers: [ShipmentsController, QuotesController],
  providers: [ShipmentsService, EtaService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
