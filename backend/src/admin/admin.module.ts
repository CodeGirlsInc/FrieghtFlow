import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarriersModule } from '../carriers/carriers.module';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/entities/user.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Payment } from '../payments/entities/payment.entity';
import { StellarModule } from '../stellar/stellar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Shipment, Payment]),
    CarriersModule,
    StellarModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
