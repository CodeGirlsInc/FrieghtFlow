import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Notification])],
  providers: [TasksService],
})
export class TasksModule {}
