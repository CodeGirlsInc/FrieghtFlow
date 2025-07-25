import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BullModule } from "@nestjs/bull"
import { CacheModule } from "@nestjs/cache-manager"
import { EmailService } from "./services/email.service"
import { TemplateService } from "./services/template.service"
import { NotificationService } from "./services/notification.service"
import { EmailController } from "./controllers/email.controller"
import { EmailWebhookController } from "./webhooks/email-webhook.controller"
import { EmailProcessor } from "./processors/email.processor"
import { EmailProviderFactory } from "./factories/email-provider.factory"
import { EmailTemplateEntity } from "./entities/email-template.entity"
import { EmailMessageEntity } from "./entities/email-message.entity"
import { EmailUnsubscribeEntity } from "./entities/email-unsubscribe.entity"
import { BulkEmailJobEntity } from "./entities/bulk-email-job.entity"
import emailConfig from "./config/email.config"
import { LoggerModule } from "../logger/logger.module"

@Module({
  imports: [
    ConfigModule.forFeature(emailConfig),
    TypeOrmModule.forFeature([EmailTemplateEntity, EmailMessageEntity, EmailUnsubscribeEntity, BulkEmailJobEntity]),
    BullModule.registerQueue({
      name: "email",
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    }),
    CacheModule.register({
      ttl: 3600, // 1 hour
      max: 1000, // maximum number of items in cache
    }),
    LoggerModule,
  ],
  providers: [EmailService, TemplateService, NotificationService, EmailProcessor, EmailProviderFactory],
  controllers: [EmailController, EmailWebhookController],
  exports: [EmailService, TemplateService, NotificationService],
})
export class EmailModule {}
