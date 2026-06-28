import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarriersModule } from '../carriers/carriers.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { AdminStatsModule } from '../admin-stats/admin-stats.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Shipment]),
    CarriersModule,
    AdminStatsModule,
    QueueModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
