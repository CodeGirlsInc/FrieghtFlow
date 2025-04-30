import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { Payment } from "./entities/payment.entity"
import { PaymentService } from "./payment.service"
import { PaymentController } from "./payment.controller"
import { StripePaymentProvider } from "./providers/stripe-payment.provider"
import { StarknetPaymentProvider } from "./providers/starknet-payment.provider"

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), ConfigModule],
  controllers: [PaymentController],
  providers: [PaymentService, StripePaymentProvider, StarknetPaymentProvider],
  exports: [PaymentService],
})
export class PaymentModule {
  constructor(
    private paymentService: PaymentService,
    private stripePaymentProvider: StripePaymentProvider,
    private starknetPaymentProvider: StarknetPaymentProvider,
  ) {
    // Register payment providers
    this.paymentService.registerProvider(this.stripePaymentProvider)
    this.paymentService.registerProvider(this.starknetPaymentProvider)
  }
}
