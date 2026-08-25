import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { StellarContractService } from './services/stellar-contract.service';
import { PaymentPollerService } from './services/payment-poller.service';
import { PaymentsGateway } from './gateways/payments.gateway';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [StellarContractService, PaymentPollerService, PaymentsGateway],
  exports: [StellarContractService, PaymentPollerService, PaymentsGateway],
})
export class PaymentsModule {}
