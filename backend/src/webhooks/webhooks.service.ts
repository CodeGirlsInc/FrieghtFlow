import { Injectable, Logger, BadRequestException } from "@nestjs/common"
import type { EventEmitter2 } from "@nestjs/event-emitter"
import { type Repository, Between, type FindOptionsWhere } from "typeorm"
import type { WebhookEvent } from "./entities/webhook-event.entity"
import { WebhookStatus } from "./entities/webhook-event.entity"
import type { FilterWebhookEventsDto } from "./dto/filter-webhook-events.dto"
import type { WebhookValidationResult } from "./interfaces/webhook-source.interface"
import type { WebhookSourceRegistry } from "./webhook-source.registry"

export interface PaginatedWebhookEvents {
  data: WebhookEvent[]
  total: number
  page: number
  limit: number
  totalPages: number
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name)

  constructor(
    private readonly webhookEventRepository: Repository<WebhookEvent>,
    private readonly eventEmitter: EventEmitter2,
    private readonly sourceRegistry: WebhookSourceRegistry,
  ) {}

  async processWebhook(
    source: string,
    rawPayload: string,
    headers: Record<string, string>,
    ipAddress?: string,
  ): Promise<WebhookEvent> {
    this.logger.log(`Processing webhook from source: ${source}`)

    // Validate source
    if (!this.sourceRegistry.isValidSource(source)) {
      throw new BadRequestException(`Unknown webhook source: ${source}`)
    }

    const sourceConfig = this.sourceRegistry.getSourceConfig(source)!
    const validator = this.sourceRegistry.getValidator(source)!

    let payload: any
    try {
      payload = JSON.parse(rawPayload)
    } catch (error) {
      this.logger.error(`Invalid JSON payload from ${source}`, error.stack)
      throw new BadRequestException("Invalid JSON payload")
    }

    // Validate webhook
    const validationResult = await this.validateWebhook(source, rawPayload, headers, payload)

    // Extract event information
    const { eventType, eventId } = validator.extractEventInfo(headers, payload)

    if (!eventType) {
      throw new BadRequestException("Event type not found in webhook")
    }

    // Create webhook event record
    const webhookEvent = this.webhookEventRepository.create({
      source,
      eventType,
      eventId,
      payload,
      headers,
      status: validationResult.isValid ? WebhookStatus.PENDING : WebhookStatus.FAILED,
      signatureValid: validationResult.isValid,
      ipAddress,
      userAgent: headers["user-agent"],
      lastError: validationResult.error,
    })

    const savedEvent = await this.webhookEventRepository.save(webhookEvent)

    // Emit internal event if validation passed
    if (validationResult.isValid) {
      await this.emitInternalEvent(savedEvent)
    } else {
      this.logger.warn(`Webhook validation failed for ${source}: ${validationResult.error}`)
    }

    return savedEvent
  }

  async validateWebhook(
    source: string,
    rawPayload: string,
    headers: Record<string, string>,
    payload: any,
  ): Promise<WebhookValidationResult> {
    const sourceConfig = this.sourceRegistry.getSourceConfig(source)!
    const validator = this.sourceRegistry.getValidator(source)!

    try {
      // Extract event info first
      const { eventType, eventId } = validator.extractEventInfo(headers, payload)

      if (!eventType) {
        return {
          isValid: false,
          error: "Event type not found",
        }
      }

      // Validate event type
      if (!validator.validateEventType(eventType)) {
        return {
          isValid: false,
          eventType,
          eventId,
          error: `Event type '${eventType}' not allowed for source '${source}'`,
        }
      }

      // Validate signature if required
      if (sourceConfig.validateSignature && sourceConfig.secretKey) {
        const signature = headers[sourceConfig.signatureHeader!]
        if (!signature) {
          return {
            isValid: false,
            eventType,
            eventId,
            error: `Missing signature header: ${sourceConfig.signatureHeader}`,
          }
        }

        const isSignatureValid = validator.validateSignature(rawPayload, signature, sourceConfig.secretKey)
        if (!isSignatureValid) {
          return {
            isValid: false,
            eventType,
            eventId,
            error: "Invalid signature",
          }
        }
      }

      return {
        isValid: true,
        eventType,
        eventId,
      }
    } catch (error) {
      this.logger.error(`Webhook validation error for ${source}`, error.stack)
      return {
        isValid: false,
        error: error.message,
      }
    }
  }

  private async emitInternalEvent(webhookEvent: WebhookEvent): Promise<void> {
    try {
      // Update status to processing
      await this.updateEventStatus(webhookEvent.id, WebhookStatus.PROCESSING)

      // Emit the event
      const eventName = `webhook.${webhookEvent.source}.${webhookEvent.eventType}`
      this.eventEmitter.emit(eventName, {
        id: webhookEvent.id,
        source: webhookEvent.source,
        eventType: webhookEvent.eventType,
        eventId: webhookEvent.eventId,
        payload: webhookEvent.payload,
        headers: webhookEvent.headers,
        createdAt: webhookEvent.createdAt,
      })

      this.logger.log(`Emitted internal event: ${eventName}`)

      // Update status to processed
      await this.updateEventStatus(webhookEvent.id, WebhookStatus.PROCESSED, new Date())
    } catch (error) {
      this.logger.error(`Failed to emit internal event for webhook ${webhookEvent.id}`, error.stack)
      await this.updateEventStatus(webhookEvent.id, WebhookStatus.FAILED, undefined, error.message)
    }
  }

  async updateEventStatus(eventId: string, status: WebhookStatus, processedAt?: Date, error?: string): Promise<void> {
    const updateData: Partial<WebhookEvent> = {
      status,
      processedAt,
    }

    if (error) {
      updateData.lastError = error
      updateData.processingAttempts = () => "processing_attempts + 1" as any
    }

    await this.webhookEventRepository.update(eventId, updateData)
  }

  async findAll(filterDto: FilterWebhookEventsDto): Promise<PaginatedWebhookEvents> {
    const { page = 1, limit = 50, sortByDateDesc = true, ...filters } = filterDto

    const where: FindOptionsWhere<WebhookEvent> = {}

    // Apply filters
    if (filters.source) {
      where.source = filters.source
    }

    if (filters.eventType) {
      where.eventType = filters.eventType
    }

    if (filters.eventId) {
      where.eventId = filters.eventId
    }

    if (filters.status) {
      where.status = filters.status
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      const startDate = filters.startDate ? new Date(filters.startDate) : new Date("1970-01-01")
      const endDate = filters.endDate ? new Date(filters.endDate) : new Date()
      where.createdAt = Between(startDate, endDate)
    }

    const [data, total] = await this.webhookEventRepository.findAndCount({
      where,
      order: {
        createdAt: sortByDateDesc ? "DESC" : "ASC",
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string): Promise<WebhookEvent | null> {
    return this.webhookEventRepository.findOne({ where: { id } })
  }

  async getWebhookStats(source?: string): Promise<{
    totalEvents: number
    successfulEvents: number
    failedEvents: number
    pendingEvents: number
    eventsBySource: { source: string; count: number }[]
    recentActivity: Date | null
  }> {
    const queryBuilder = this.webhookEventRepository.createQueryBuilder("event")

    if (source) {
      queryBuilder.where("event.source = :source", { source })
    }

    const totalEvents = await queryBuilder.getCount()

    const successfulEvents = await queryBuilder
      .clone()
      .andWhere("event.status = :status", { status: WebhookStatus.PROCESSED })
      .getCount()

    const failedEvents = await queryBuilder
      .clone()
      .andWhere("event.status = :status", { status: WebhookStatus.FAILED })
      .getCount()

    const pendingEvents = await queryBuilder
      .clone()
      .andWhere("event.status IN (:...statuses)", {
        statuses: [WebhookStatus.PENDING, WebhookStatus.PROCESSING, WebhookStatus.RETRYING],
      })
      .getCount()

    const eventsBySourceResult = await this.webhookEventRepository
      .createQueryBuilder("event")
      .select("event.source", "source")
      .addSelect("COUNT(*)", "count")
      .groupBy("event.source")
      .orderBy("count", "DESC")
      .getRawMany()

    const recentActivityResult = await queryBuilder.clone().select("MAX(event.createdAt)", "lastActivity").getRawOne()

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      pendingEvents,
      eventsBySource: eventsBySourceResult.map((item) => ({
        source: item.source,
        count: Number.parseInt(item.count),
      })),
      recentActivity: recentActivityResult.lastActivity ? new Date(recentActivityResult.lastActivity) : null,
    }
  }

  async retryFailedEvent(eventId: string): Promise<WebhookEvent> {
    const event = await this.webhookEventRepository.findOne({ where: { id: eventId } })

    if (!event) {
      throw new BadRequestException("Webhook event not found")
    }

    if (event.status !== WebhookStatus.FAILED) {
      throw new BadRequestException("Only failed events can be retried")
    }

    // Update status to retrying
    await this.updateEventStatus(eventId, WebhookStatus.RETRYING)

    // Re-emit the event
    await this.emitInternalEvent(event)

    return this.webhookEventRepository.findOne({ where: { id: eventId } })!
  }
}
