import { Injectable, Logger } from "@nestjs/common"
import type { WebhookHandler } from "../interfaces/webhook-handler.interface"
import { type WebhookEvent, WebhookProvider } from "../entities/webhook-event.entity"

@Injectable()
export class EmailBouncedHandler implements WebhookHandler {
  private readonly logger = new Logger(EmailBouncedHandler.name)

  canHandle(webhookEvent: WebhookEvent): boolean {
    return webhookEvent.provider === WebhookProvider.EMAIL && webhookEvent.eventType === "bounced"
  }

  async handle(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log(`Handling email bounced event: ${webhookEvent.externalId}`)

    // Implement your business logic here
    // For example:
    // - Mark email as invalid
    // - Update user's contact preferences
    // - Log bounce for analytics

    this.logger.log(`Successfully processed email bounce: ${webhookEvent.externalId}`)
  }
}
