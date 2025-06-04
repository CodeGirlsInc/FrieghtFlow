import type { WebhookEvent } from "../entities/webhook-event.entity"

export interface WebhookHandler {
  canHandle(webhookEvent: WebhookEvent): boolean
  handle(webhookEvent: WebhookEvent): Promise<void>
}
