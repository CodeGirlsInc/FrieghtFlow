import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { ShipmentStatusHistoryService } from './shipment-status-history.service';
import { ShipmentHistoryController } from './shipment-history.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentStatusHistory])],
  providers: [ShipmentStatusHistoryService],
  controllers: [ShipmentHistoryController],
  exports: [ShipmentStatusHistoryService],
})
export class ShipmentHistoryModule {}
