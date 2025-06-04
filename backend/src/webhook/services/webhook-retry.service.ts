import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { type Repository, LessThanOrEqual } from "typeorm"
import { WebhookEvent, WebhookStatus } from "../entities/webhook-event.entity"
import type { WebhookEventProcessor } from "../processors/webhook-event.processor"

@Injectable()
export class WebhookRetryService {
  private readonly logger = new Logger(WebhookRetryService.name)
  private readonly maxRetries = 5
  private readonly retryDelays = [
    1 * 60 * 1000, // 1 minute
    5 * 60 * 1000, // 5 minutes
    15 * 60 * 1000, // 15 minutes
    60 * 60 * 1000, // 1 hour
    6 * 60 * 60 * 1000, // 6 hours
  ];

  constructor(
    @InjectRepository(WebhookEvent)
    private webhookEventRepository: Repository<WebhookEvent>,
    private readonly webhookEventProcessor: WebhookEventProcessor,
  ) {}

  async scheduleRetry(webhookEvent: WebhookEvent): Promise<WebhookEvent> {
    try {
      if (webhookEvent.retryCount >= this.maxRetries) {
        this.logger.warn(`Maximum retry attempts reached for webhook ${webhookEvent.id}`)

        webhookEvent.status = WebhookStatus.FAILED
        return this.webhookEventRepository.save(webhookEvent)
      }

      // Calculate next retry time with exponential backoff
      const retryDelay = this.retryDelays[webhookEvent.retryCount] || this.retryDelays[this.retryDelays.length - 1]

      const nextRetryAt = new Date(Date.now() + retryDelay)

      webhookEvent.status = WebhookStatus.RETRY
      webhookEvent.retryCount += 1
      webhookEvent.nextRetryAt = nextRetryAt

      const savedEvent = await this.webhookEventRepository.save(webhookEvent)

      this.logger.log(
        `Scheduled retry ${savedEvent.retryCount} for webhook ${savedEvent.id} at ${nextRetryAt.toISOString()}`,
      )

      return savedEvent
    } catch (error) {
      this.logger.error(`Error scheduling retry for webhook ${webhookEvent.id}: ${error.message}`, error.stack)
      throw error
    }
  }

  async processScheduledRetries(): Promise<void> {
    try {
      const now = new Date()

      const webhooksToRetry = await this.webhookEventRepository.find({
        where: {
          status: WebhookStatus.RETRY,
          nextRetryAt: LessThanOrEqual(now),
        },
        order: { nextRetryAt: "ASC" },
        take: 50, // Process in batches
      })

      this.logger.log(`Found ${webhooksToRetry.length} webhooks to retry`)

      for (const webhook of webhooksToRetry) {
        // Update status to prevent duplicate processing
        webhook.status = WebhookStatus.PENDING
        await this.webhookEventRepository.save(webhook)

        // Process the webhook
        this.webhookEventProcessor.process(webhook.id).catch((error) => {
          this.logger.error(`Error processing retry for webhook ${webhook.id}: ${error.message}`, error.stack)
        })
      }
    } catch (error) {
      this.logger.error(`Error processing scheduled retries: ${error.message}`, error.stack)
    }
  }

  async replayWebhook(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const webhookEvent = await this.webhookEventRepository.findOne({
        where: { id },
      })

      if (!webhookEvent) {
        return { success: false, message: `Webhook event with ID ${id} not found` }
      }

      // Reset retry count and status
      webhookEvent.retryCount = 0
      webhookEvent.status = WebhookStatus.PENDING
      webhookEvent.errorMessage = null
      webhookEvent.nextRetryAt = null

      await this.webhookEventRepository.save(webhookEvent)

      // Process the webhook
      this.webhookEventProcessor.process(webhookEvent.id).catch((error) => {
        this.logger.error(`Error replaying webhook ${webhookEvent.id}: ${error.message}`, error.stack)
      })

      return {
        success: true,
        message: `Webhook ${id} has been queued for replay`,
      }
    } catch (error) {
      this.logger.error(`Error replaying webhook ${id}: ${error.message}`, error.stack)
      return {
        success: false,
        message: `Error replaying webhook: ${error.message}`,
      }
    }
  }

  async replayAllFailedWebhooks(provider?: string): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const queryBuilder = this.webhookEventRepository
        .createQueryBuilder("webhook")
        .where("webhook.status = :status", { status: WebhookStatus.FAILED })

      if (provider) {
        queryBuilder.andWhere("webhook.provider = :provider", { provider })
      }

      const failedWebhooks = await queryBuilder.getMany()

      this.logger.log(`Found ${failedWebhooks.length} failed webhooks to replay`)

      for (const webhook of failedWebhooks) {
        // Reset retry count and status
        webhook.retryCount = 0
        webhook.status = WebhookStatus.PENDING
        webhook.errorMessage = null
        webhook.nextRetryAt = null

        await this.webhookEventRepository.save(webhook)

        // Process the webhook
        this.webhookEventProcessor.process(webhook.id).catch((error) => {
          this.logger.error(`Error replaying webhook ${webhook.id}: ${error.message}`, error.stack)
        })
      }

      return {
        success: true,
        count: failedWebhooks.length,
        message: `${failedWebhooks.length} failed webhooks have been queued for replay`,
      }
    } catch (error) {
      this.logger.error(`Error replaying failed webhooks: ${error.message}`, error.stack)
      return {
        success: false,
        count: 0,
        message: `Error replaying failed webhooks: ${error.message}`,
      }
    }
  }
}
