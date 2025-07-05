import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type BlockchainEvent, EventStatus, EventType } from "../entities/blockchain-event.entity"
import type { StarkNetClientService } from "./starknet-client.service"
import type { StarkNetEventData, EventProcessingResult } from "../interfaces/blockchain-event-logger.interface"

@Injectable()
export class EventProcessorService {
  private readonly logger = new Logger(EventProcessorService.name)

  constructor(
    private readonly blockchainEventRepository: Repository<BlockchainEvent>,
    private readonly starknetClient: StarkNetClientService,
  ) {}

  /**
   * Process a batch of StarkNet events
   */
  async processBatch(events: StarkNetEventData[]): Promise<EventProcessingResult[]> {
    const results: EventProcessingResult[] = []

    for (const eventData of events) {
      const startTime = Date.now()
      try {
        const result = await this.processEvent(eventData)
        results.push({
          eventId: result.id,
          success: true,
          processingTime: Date.now() - startTime,
          retryCount: 0,
        })
      } catch (error) {
        this.logger.error(`Failed to process event ${eventData.transactionHash}`, error)
        results.push({
          eventId: eventData.transactionHash,
          success: false,
          error: error.message,
          processingTime: Date.now() - startTime,
          retryCount: 0,
        })
      }
    }

    return results
  }

  /**
   * Process a single StarkNet event
   */
  async processEvent(eventData: StarkNetEventData): Promise<BlockchainEvent> {
    // Check if event already exists
    const existingEvent = await this.blockchainEventRepository.findOne({
      where: {
        transactionHash: eventData.transactionHash,
        contractAddress: eventData.contractAddress,
        logIndex: eventData.logIndex,
      },
    })

    if (existingEvent) {
      this.logger.debug(`Event already exists: ${eventData.transactionHash}`)
      return existingEvent
    }

    // Get block information for timestamp
    let blockTimestamp = eventData.blockTimestamp
    try {
      const block = await this.starknetClient.getBlock(eventData.blockNumber)
      blockTimestamp = block.timestamp
    } catch (error) {
      this.logger.warn(`Failed to get block timestamp for block ${eventData.blockNumber}`, error)
    }

    // Decode event data
    const decodedData = this.starknetClient.decodeEventData(eventData.eventName, eventData.data, eventData.keys)

    // Map event name to EventType enum
    const eventType = this.mapEventNameToType(eventData.eventName)

    // Create blockchain event record
    const blockchainEvent = this.blockchainEventRepository.create({
      transactionHash: eventData.transactionHash,
      contractAddress: eventData.contractAddress,
      eventType,
      blockNumber: eventData.blockNumber,
      logIndex: eventData.logIndex,
      eventData: {
        data: eventData.data,
        keys: eventData.keys,
        eventName: eventData.eventName,
      },
      decodedData,
      blockTimestamp,
      status: EventStatus.PROCESSED,
      metadata: {
        processedAt: new Date(),
        processingVersion: "1.0.0",
      },
    })

    const savedEvent = await this.blockchainEventRepository.save(blockchainEvent)

    this.logger.debug(`Processed event: ${eventData.eventName} from tx ${eventData.transactionHash}`)

    return savedEvent
  }

  /**
   * Retry failed events
   */
  async retryFailedEvents(maxRetries = 3): Promise<EventProcessingResult[]> {
    const failedEvents = await this.blockchainEventRepository.find({
      where: [{ status: EventStatus.FAILED }, { status: EventStatus.RETRYING }],
      order: { createdAt: "ASC" },
      take: 100, // Process in batches
    })

    const results: EventProcessingResult[] = []

    for (const event of failedEvents) {
      if (event.retryCount >= maxRetries) {
        this.logger.warn(`Event ${event.id} exceeded max retries (${maxRetries})`)
        continue
      }

      const startTime = Date.now()
      try {
        // Update retry status
        event.status = EventStatus.RETRYING
        event.retryCount += 1
        event.lastRetryAt = new Date()
        await this.blockchainEventRepository.save(event)

        // Attempt to reprocess
        await this.reprocessEvent(event)

        // Mark as processed
        event.status = EventStatus.PROCESSED
        event.errorMessage = null
        await this.blockchainEventRepository.save(event)

        results.push({
          eventId: event.id,
          success: true,
          processingTime: Date.now() - startTime,
          retryCount: event.retryCount,
        })

        this.logger.log(`Successfully retried event ${event.id} (attempt ${event.retryCount})`)
      } catch (error) {
        event.status = EventStatus.FAILED
        event.errorMessage = error.message
        await this.blockchainEventRepository.save(event)

        results.push({
          eventId: event.id,
          success: false,
          error: error.message,
          processingTime: Date.now() - startTime,
          retryCount: event.retryCount,
        })

        this.logger.error(`Failed to retry event ${event.id} (attempt ${event.retryCount})`, error)
      }
    }

    return results
  }

  /**
   * Reprocess an existing event (for retry logic)
   */
  private async reprocessEvent(event: BlockchainEvent): Promise<void> {
    // Re-decode event data with latest decoder
    if (event.eventData && event.eventData.eventName) {
      const decodedData = this.starknetClient.decodeEventData(
        event.eventData.eventName,
        event.eventData.data,
        event.eventData.keys,
      )

      event.decodedData = decodedData
      event.metadata = {
        ...event.metadata,
        reprocessedAt: new Date(),
        reprocessingVersion: "1.0.0",
      }
    }

    // Additional processing logic can be added here
    // For example, triggering webhooks, updating related entities, etc.
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(): Promise<{
    totalEvents: number
    processedEvents: number
    failedEvents: number
    pendingEvents: number
    averageProcessingTime: number
  }> {
    const [totalEvents, processedEvents, failedEvents, pendingEvents] = await Promise.all([
      this.blockchainEventRepository.count(),
      this.blockchainEventRepository.count({ where: { status: EventStatus.PROCESSED } }),
      this.blockchainEventRepository.count({ where: { status: EventStatus.FAILED } }),
      this.blockchainEventRepository.count({ where: { status: EventStatus.PENDING } }),
    ])

    // Calculate average processing time (simplified)
    const recentEvents = await this.blockchainEventRepository.find({
      where: { status: EventStatus.PROCESSED },
      order: { createdAt: "DESC" },
      take: 100,
    })

    const averageProcessingTime =
      recentEvents.length > 0
        ? recentEvents.reduce((sum, event) => {
            const processingTime = event.metadata?.processingTime || 0
            return sum + processingTime
          }, 0) / recentEvents.length
        : 0

    return {
      totalEvents,
      processedEvents,
      failedEvents,
      pendingEvents,
      averageProcessingTime,
    }
  }

  /**
   * Map event name to EventType enum
   */
  private mapEventNameToType(eventName: string): EventType {
    const eventTypeMap: Record<string, EventType> = {
      delivery_confirmed: EventType.DELIVERY_CONFIRMED,
      escrow_released: EventType.ESCROW_RELEASED,
      escrow_created: EventType.ESCROW_CREATED,
      payment_processed: EventType.PAYMENT_PROCESSED,
      shipment_created: EventType.SHIPMENT_CREATED,
      dispute_raised: EventType.DISPUTE_RAISED,
      dispute_resolved: EventType.DISPUTE_RESOLVED,
      contract_deployed: EventType.CONTRACT_DEPLOYED,
    }

    return eventTypeMap[eventName] || EventType.SHIPMENT_CREATED
  }

  /**
   * Clean up old processed events
   */
  async cleanupOldEvents(daysToKeep = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    const result = await this.blockchainEventRepository
      .createQueryBuilder()
      .delete()
      .where("status = :status", { status: EventStatus.PROCESSED })
      .andWhere("createdAt < :cutoffDate", { cutoffDate })
      .execute()

    this.logger.log(`Cleaned up ${result.affected} old events older than ${daysToKeep} days`)
    return result.affected || 0
  }
}
