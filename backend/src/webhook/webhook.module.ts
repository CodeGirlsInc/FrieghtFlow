import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"

import { WebhookController } from "./controllers/webhook.controller"
import { StripeWebhookController } from "./controllers/stripe-webhook.controller"
import { EmailWebhookController } from "./controllers/email-webhook.controller"

import { WebhookService } from "./services/webhook.service"
import { StripeWebhookService } from "./services/stripe-webhook.service"
import { EmailWebhookService } from "./services/email-webhook.service"
import { WebhookVerificationService } from "./services/webhook-verification.service"
import { WebhookRetryService } from "./services/webhook-retry.service"

import { WebhookEvent } from "./entities/webhook-event.entity"
import { WebhookEventProcessor } from "./processors/webhook-event.processor"
import { WebhookRetryTask } from "./tasks/webhook-retry.task"

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEvent]), ConfigModule],
  controllers: [WebhookController, StripeWebhookController, EmailWebhookController],
  providers: [
    WebhookService,
    StripeWebhookService,
    EmailWebhookService,
    WebhookVerificationService,
    WebhookRetryService,
    WebhookEventProcessor,
    WebhookRetryTask,
  ],
  exports: [WebhookService, WebhookRetryService],
})
export class WebhookModule {}
