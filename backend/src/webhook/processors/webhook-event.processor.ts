import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { WebhookEvent, WebhookStatus, WebhookProvider } from "../entities/webhook-event.entity"
import type { WebhookRetryService } from "../services/webhook-retry.service"

@Injectable()
export class WebhookEventProcessor {
  private readonly logger = new Logger(WebhookEventProcessor.name);

  constructor(
    private webhookEventRepository: Repository<WebhookEvent>,
    private webhookRetryService: WebhookRetryService,
    @InjectRepository(WebhookEvent)
  ) {}

  async process(webhookId: string): Promise<void> {
    const webhookEvent = await this.webhookEventRepository.findOne({
      where: { id: webhookId },
    })

    if (!webhookEvent) {
      this.logger.error(`Webhook event with ID ${webhookId} not found`)
      return
    }

    try {
      // Update status to processing
      webhookEvent.status = WebhookStatus.PROCESSING
      await this.webhookEventRepository.save(webhookEvent)

      // Process based on provider and event type
      switch (webhookEvent.provider) {
        case WebhookProvider.STRIPE:
          await this.processStripeWebhook(webhookEvent)
          break
        case WebhookProvider.EMAIL:
          await this.processEmailWebhook(webhookEvent)
          break
        default:
          await this.processGenericWebhook(webhookEvent)
      }

      // Mark as processed
      webhookEvent.status = WebhookStatus.PROCESSED
      webhookEvent.processedAt = new Date()
      await this.webhookEventRepository.save(webhookEvent)

      this.logger.log(`Successfully processed webhook ${webhookId}`)
    } catch (error) {
      this.logger.error(`Error processing webhook ${webhookId}: ${error.message}`, error.stack)

      // Update webhook with error information
      webhookEvent.errorMessage = error.message

      // Schedule retry
      await this.webhookRetryService.scheduleRetry(webhookEvent)
    }
  }

  private async processStripeWebhook(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log(`Processing Stripe webhook: ${webhookEvent.eventType} (${webhookEvent.externalId})`)

    // Here you would implement the actual business logic for handling different Stripe events
    switch (webhookEvent.eventType) {
      case "payment_intent.succeeded":
        await this.handlePaymentSucceeded(webhookEvent)
        break
      case "invoice.payment_failed":
        await this.handlePaymentFailed(webhookEvent)
        break
      case "customer.subscription.created":
        await this.handleSubscriptionCreated(webhookEvent)
        break
      case "customer.subscription.deleted":
        await this.handleSubscriptionDeleted(webhookEvent)
        break
      default:
        this.logger.log(`Unhandled Stripe event type: ${webhookEvent.eventType}`)
    }
  }

  private async processEmailWebhook(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log(`Processing Email webhook: ${webhookEvent.eventType} (${webhookEvent.externalId})`)

    // Here you would implement the actual business logic for handling different email provider events
    switch (webhookEvent.eventType) {
      case "delivered":
        await this.handleEmailDelivered(webhookEvent)
        break
      case "bounced":
        await this.handleEmailBounced(webhookEvent)
        break
      case "opened":
        await this.handleEmailOpened(webhookEvent)
        break
      case "clicked":
        await this.handleEmailClicked(webhookEvent)
        break
      default:
        this.logger.log(`Unhandled Email event type: ${webhookEvent.eventType}`)
    }
  }

  private async processGenericWebhook(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log(`Processing Generic webhook: ${webhookEvent.eventType} (${webhookEvent.externalId})`)

    // Handle generic webhook events
    // This is where you would implement custom logic for other webhook providers
  }

  // Example handlers for specific webhook events
  private async handlePaymentSucceeded(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling payment succeeded event")

    // Example business logic:
    // - Update order status to paid
    // - Send confirmation email to customer
    // - Update user's subscription status
    // - Trigger fulfillment process

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async handlePaymentFailed(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling payment failed event")

    // Example business logic:
    // - Update order status to failed
    // - Send payment failure notification
    // - Suspend subscription if applicable
    // - Log for analytics

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async handleSubscriptionCreated(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling subscription created event")

    // Example business logic:
    // - Create user subscription record
    // - Send welcome email
    // - Grant access to premium features

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async handleSubscriptionDeleted(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling subscription deleted event")

    // Example business logic:
    // - Revoke premium access
    // - Send cancellation confirmation
    // - Schedule data cleanup

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async handleEmailDelivered(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling email delivered event")

    // Example business logic:
    // - Update email status to delivered
    // - Track delivery metrics
    // - Update user engagement data

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async handleEmailBounced(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling email bounced event")

    // Example business logic:
    // - Mark email as invalid
    // - Update user's contact preferences
    // - Log bounce for analytics
    // - Potentially suspend email sending to this address

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async handleEmailOpened(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling email opened event")

    // Example business logic:
    // - Track email open metrics
    // - Update user engagement score
    // - Trigger follow-up campaigns

    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  private async handleEmailClicked(webhookEvent: WebhookEvent): Promise<void> {
    this.logger.log("Handling email clicked event")

    // Example business logic:
    // - Track click-through metrics
    // - Update user interest profile
    // - Trigger conversion tracking

    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
