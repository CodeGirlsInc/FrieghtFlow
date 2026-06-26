import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { BulkShipmentsService } from './bulk-shipments.service';
import { BulkShipmentsController } from './bulk-shipments.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment])],
  controllers: [BulkShipmentsController],
  providers: [BulkShipmentsService],
})
export class BulkShipmentsModule {}
