import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment } from './entities/payment.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { User } from '../users/entities/user.entity';
import { StellarModule } from '../stellar/stellar.module';
import { PaymentFundingReconcilerScheduler } from './payment-funding-reconciler.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Shipment, User]), StellarModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentFundingReconcilerScheduler],
  exports: [PaymentsService],
})
export class PaymentsModule {}
