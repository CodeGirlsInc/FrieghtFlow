import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bid } from '../bids/entities/bid.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bid, Shipment, Document])],
  providers: [TasksService],
})
export class TasksModule {}
