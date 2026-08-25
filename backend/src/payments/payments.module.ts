import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StellarContractService } from './services/stellar-contract.service';
import { PaymentPollerService } from './services/payment-poller.service';
import { PaymentReconciliationService } from './services/payment-reconciliation.service';
import { PaymentReconciliationController } from './controllers/payment-reconciliation.controller';
import { PaymentsGateway } from './gateways/payments.gateway';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [PaymentReconciliationController],
  providers: [
    StellarContractService,
    PaymentPollerService,
    PaymentReconciliationService,
    PaymentsGateway,
  ],
  exports: [
    StellarContractService,
    PaymentPollerService,
    PaymentReconciliationService,
    PaymentsGateway,
  ],
})
export class PaymentsModule {}
