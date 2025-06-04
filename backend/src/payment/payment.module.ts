import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { HttpModule } from "@nestjs/axios"

import { PaymentController } from "./controllers/payment.controller"
import { StripeWebhookController } from "./controllers/stripe-webhook.controller"
import { StellarWebhookController } from "./controllers/stellar-webhook.controller"

import { PaymentService } from "./services/payment.service"
import { StripeService } from "./services/stripe.service"
import { StellarService } from "./services/stellar.service"
import { PaymentVerificationService } from "./services/payment-verification.service"

import { TransactionModule } from "../transaction/transaction.module"
import { WebhookModule } from "../webhook/webhook.module"

@Module({
  imports: [ConfigModule, HttpModule, TransactionModule, WebhookModule],
  controllers: [PaymentController, StripeWebhookController, StellarWebhookController],
  providers: [PaymentService, StripeService, StellarService, PaymentVerificationService],
  exports: [PaymentService, StripeService, StellarService],
})
export class PaymentModule {}
