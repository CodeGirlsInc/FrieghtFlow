import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispute } from './entities/dispute.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { DisputesService } from './disputes.service';
import { DisputesController } from './disputes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Dispute, Shipment])],
  controllers: [DisputesController],
  providers: [DisputesService],
})
export class DisputesModule {}
