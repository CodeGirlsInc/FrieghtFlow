import { Injectable, Logger } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { WebhookEvent, WebhookStatus } from "../entities/webhook-event.entity"
import type { WebhookEventDto } from "../dto/webhook-event.dto"
import type { WebhookEventProcessor } from "../processors/webhook-event.processor"

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private webhookEventProcessor: WebhookEventProcessor,
    @InjectRepository(WebhookEvent)
    private webhookEventRepository: Repository<WebhookEvent>,
  ) {}

  async processWebhook(webhookData: WebhookEventDto): Promise<{ success: boolean; id: string }> {
    try {
      // Create a new webhook event record
      const webhookEvent = this.webhookEventRepository.create({
        externalId: webhookData.id || `generic-${Date.now()}`,
        provider: webhookData.provider,
        eventType: webhookData.eventType,
        payload: webhookData.payload,
        headers: webhookData.headers,
        status: WebhookStatus.PENDING,
      })

      // Save the webhook event to the database
      const savedEvent = await this.webhookEventRepository.save(webhookEvent)

      // Process the webhook asynchronously
      this.webhookEventProcessor.process(savedEvent.id).catch((error) => {
        this.logger.error(`Error processing webhook ${savedEvent.id}: ${error.message}`, error.stack)
      })

      return { success: true, id: savedEvent.id }
    } catch (error) {
      this.logger.error(`Error saving webhook: ${error.message}`, error.stack)
      throw error
    }
  }

  async getWebhookById(id: string): Promise<WebhookEvent> {
    return this.webhookEventRepository.findOne({ where: { id } })
  }

  async updateWebhookStatus(id: string, status: WebhookStatus, errorMessage?: string): Promise<WebhookEvent> {
    const webhookEvent = await this.getWebhookById(id)

    if (!webhookEvent) {
      throw new Error(`Webhook event with ID ${id} not found`)
    }

    webhookEvent.status = status

    if (status === WebhookStatus.PROCESSED) {
      webhookEvent.processedAt = new Date()
    }

    if (errorMessage) {
      webhookEvent.errorMessage = errorMessage
    }

    return this.webhookEventRepository.save(webhookEvent)
  }

  async getFailedWebhooks(provider?: string, limit = 50, offset = 0): Promise<{ data: WebhookEvent[]; total: number }> {
    const queryBuilder = this.webhookEventRepository
      .createQueryBuilder("webhook")
      .where("webhook.status = :status", { status: WebhookStatus.FAILED })

    if (provider) {
      queryBuilder.andWhere("webhook.provider = :provider", { provider })
    }

    const [data, total] = await queryBuilder
      .orderBy("webhook.createdAt", "DESC")
      .take(limit)
      .skip(offset)
      .getManyAndCount()

    return { data, total }
  }

  async markWebhookAsVerified(id: string): Promise<WebhookEvent> {
    const webhookEvent = await this.getWebhookById(id)

    if (!webhookEvent) {
      throw new Error(`Webhook event with ID ${id} not found`)
    }

    webhookEvent.verified = true
    return this.webhookEventRepository.save(webhookEvent)
  }
}
