import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { WebhookRetryService } from "../services/webhook-retry.service"

@Injectable()
export class WebhookRetryTask {
  private readonly logger = new Logger(WebhookRetryTask.name)

  constructor(private webhookRetryService: WebhookRetryService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleRetries() {
    this.logger.debug("Processing scheduled webhook retries")
    await this.webhookRetryService.processScheduledRetries()
  }
}
