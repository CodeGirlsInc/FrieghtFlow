import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatusHistory } from './entities/shipment-status-history.entity';
import { DisputeEvidence } from './entities/dispute-evidence.entity';
import { DisputeEvidenceService } from './dispute-evidence.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shipment, ShipmentStatusHistory, DisputeEvidence]),
    UsersModule,
  ],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, DisputeEvidenceService],
  exports: [ShipmentsService, DisputeEvidenceService],
})
export class ShipmentsModule {}
