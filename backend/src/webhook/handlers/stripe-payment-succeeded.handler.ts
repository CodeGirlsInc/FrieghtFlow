import { Injectable, Logger } from "@nestjs/common"
import type { WebhookHandler } from "../interfaces/webhook-handler.interface"
import { type WebhookEvent, WebhookProvider } from "../entities/webhook-event.entity"

@Injectable()
export class StripePaymentSucceededHandler implements WebhookHandler {
  private readonly logger = new Logger(StripePaymentSucceededHandler.name)

  canHandle(webhookEvent: WebhookEvent): boolean {
    return webhookEvent.provider === WebhookProvider.STRIPE && webhookEvent.eventType === "payment_intent.succeeded"
  }

  async handle(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log(`Handling Stripe payment succeeded: ${webhookEvent.externalId}`)

    // Implement your business logic here
    // For example:
    // - Update order status
    // - Send confirmation email
    // - Update subscription status

    this.logger.log(`Successfully processed payment: ${webhookEvent.externalId}`)
  }
}
