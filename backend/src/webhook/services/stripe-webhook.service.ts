import { Injectable, Logger } from "@nestjs/common"
import type { WebhookService } from "./webhook.service"
import type { StripeWebhookDto } from "../dto/webhook-event.dto"
import { WebhookProvider } from "../entities/webhook-event.entity"

@Injectable()
export class StripeWebhookService {
  private readonly logger = new Logger(StripeWebhookService.name)

  constructor(private readonly webhookService: WebhookService) {}

  async processStripeWebhook(
    webhookData: StripeWebhookDto,
    rawBody: Buffer,
  ): Promise<{ success: boolean; id: string }> {
    try {
      // Map Stripe webhook data to our generic webhook format
      const webhookEventDto = {
        id: webhookData.id,
        provider: WebhookProvider.STRIPE,
        eventType: webhookData.type,
        payload: {
          ...webhookData,
          rawBody: rawBody.toString("utf8"), // Store raw body for verification purposes
        },
        headers: webhookData.headers,
      }

      // Process the webhook using the generic webhook service
      return this.webhookService.processWebhook(webhookEventDto)
    } catch (error) {
      this.logger.error(`Error processing Stripe webhook: ${error.message}`, error.stack)
      throw error
    }
  }
}
