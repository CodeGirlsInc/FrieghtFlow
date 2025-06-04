import { Injectable, Logger } from "@nestjs/common"
import type { WebhookService } from "./webhook.service"
import type { EmailWebhookDto } from "../dto/webhook-event.dto"
import { WebhookProvider } from "../entities/webhook-event.entity"

@Injectable()
export class EmailWebhookService {
  private readonly logger = new Logger(EmailWebhookService.name)

  constructor(private readonly webhookService: WebhookService) {}

  async processEmailWebhook(webhookData: EmailWebhookDto): Promise<{ success: boolean; id: string }> {
    try {
      // Map email provider webhook data to our generic webhook format
      const webhookEventDto = {
        id: webhookData.id,
        provider: WebhookProvider.EMAIL,
        eventType: webhookData.event,
        payload: webhookData.data,
        headers: webhookData.headers,
      }

      // Process the webhook using the generic webhook service
      return this.webhookService.processWebhook(webhookEventDto)
    } catch (error) {
      this.logger.error(`Error processing email webhook: ${error.message}`, error.stack)
      throw error
    }
  }
}
