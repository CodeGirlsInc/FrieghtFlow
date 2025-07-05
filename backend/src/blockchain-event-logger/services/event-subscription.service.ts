import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import type { Repository } from "typeorm"
import { type ContractSubscription, SubscriptionStatus } from "../entities/contract-subscription.entity"
import type { EventProcessingCheckpoint } from "../entities/event-processing-checkpoint.entity"
import type { StarkNetClientService } from "./starknet-client.service"
import type { EventProcessorService } from "./event-processor.service"
import type { CreateSubscriptionDto } from "../dto/create-subscription.dto"
import type { UpdateSubscriptionDto } from "../dto/update-subscription.dto"

@Injectable()
export class EventSubscriptionService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventSubscriptionService.name)
  private readonly activeSubscriptions = new Map<string, NodeJS.Timeout>()
  private isShuttingDown = false

  constructor(
    private readonly contractSubscriptionRepository: Repository<ContractSubscription>,
    private readonly checkpointRepository: Repository<EventProcessingCheckpoint>,
    private readonly starknetClient: StarkNetClientService,
    private readonly eventProcessor: EventProcessorService,
  ) {}

  async onModuleInit() {
    this.logger.log("Initializing Event Subscription Service...")
    await this.startActiveSubscriptions()
  }

  async onModuleDestroy() {
    this.logger.log("Shutting down Event Subscription Service...")
    this.isShuttingDown = true
    this.stopAllSubscriptions()
  }

  /**
   * Create a new contract subscription
   */
  async createSubscription(createSubscriptionDto: CreateSubscriptionDto): Promise<ContractSubscription> {
    const subscription = this.contractSubscriptionRepository.create({
      ...createSubscriptionDto,
      fromBlock: createSubscriptionDto.fromBlock ? BigInt(createSubscriptionDto.fromBlock) : undefined,
    })

    const savedSubscription = await this.contractSubscriptionRepository.save(subscription)

    // Start monitoring if subscription is active
    if (savedSubscription.isActive && savedSubscription.status === SubscriptionStatus.ACTIVE) {
      await this.startSubscription(savedSubscription.id)
    }

    this.logger.log(`Created subscription for contract ${savedSubscription.contractAddress}`)
    return savedSubscription
  }

  /**
   * Update an existing subscription
   */
  async updateSubscription(id: string, updateDto: UpdateSubscriptionDto): Promise<ContractSubscription> {
    const subscription = await this.contractSubscriptionRepository.findOne({ where: { id } })
    if (!subscription) {
      throw new Error(`Subscription not found: ${id}`)
    }

    Object.assign(subscription, updateDto)
    const updatedSubscription = await this.contractSubscriptionRepository.save(subscription)

    // Restart subscription if it's active
    if (updatedSubscription.isActive && updatedSubscription.status === SubscriptionStatus.ACTIVE) {
      await this.restartSubscription(id)
    } else {
      await this.stopSubscription(id)
    }

    return updatedSubscription
  }

  /**
   * Get all subscriptions
   */
  async getAllSubscriptions(): Promise<ContractSubscription[]> {
    return this.contractSubscriptionRepository.find({
      order: { createdAt: "DESC" },
    })
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(id: string): Promise<ContractSubscription> {
    const subscription = await this.contractSubscriptionRepository.findOne({ where: { id } })
    if (!subscription) {
      throw new Error(`Subscription not found: ${id}`)
    }
    return subscription
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(id: string): Promise<void> {
    await this.stopSubscription(id)
    await this.contractSubscriptionRepository.delete(id)
    this.logger.log(`Deleted subscription ${id}`)
  }

  /**
   * Start monitoring for a specific subscription
   */
  async startSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.getSubscriptionById(subscriptionId)

    if (this.activeSubscriptions.has(subscriptionId)) {
      this.logger.warn(`Subscription ${subscriptionId} is already active`)
      return
    }

    this.logger.log(`Starting subscription for contract ${subscription.contractAddress}`)

    // Set up periodic monitoring
    const interval = setInterval(async () => {
      if (this.isShuttingDown) {
        clearInterval(interval)
        return
      }

      try {
        await this.processSubscriptionEvents(subscription)
      } catch (error) {
        this.logger.error(`Error processing subscription ${subscriptionId}`, error)
        await this.handleSubscriptionError(subscription, error)
      }
    }, 10000) // Check every 10 seconds

    this.activeSubscriptions.set(subscriptionId, interval)

    // Update subscription status
    subscription.status = SubscriptionStatus.ACTIVE
    await this.contractSubscriptionRepository.save(subscription)
  }

  /**
   * Stop monitoring for a specific subscription
   */
  async stopSubscription(subscriptionId: string): Promise<void> {
    const interval = this.activeSubscriptions.get(subscriptionId)
    if (interval) {
      clearInterval(interval)
      this.activeSubscriptions.delete(subscriptionId)
      this.logger.log(`Stopped subscription ${subscriptionId}`)
    }

    // Update subscription status
    try {
      const subscription = await this.getSubscriptionById(subscriptionId)
      subscription.status = SubscriptionStatus.STOPPED
      await this.contractSubscriptionRepository.save(subscription)
    } catch (error) {
      this.logger.error(`Failed to update subscription status for ${subscriptionId}`, error)
    }
  }

  /**
   * Restart a subscription
   */
  async restartSubscription(subscriptionId: string): Promise<void> {
    await this.stopSubscription(subscriptionId)
    await this.startSubscription(subscriptionId)
  }

  /**
   * Start all active subscriptions
   */
  private async startActiveSubscriptions(): Promise<void> {
    const activeSubscriptions = await this.contractSubscriptionRepository.find({
      where: {
        isActive: true,
        status: SubscriptionStatus.ACTIVE,
      },
    })

    for (const subscription of activeSubscriptions) {
      await this.startSubscription(subscription.id)
    }

    this.logger.log(`Started ${activeSubscriptions.length} active subscriptions`)
  }

  /**
   * Stop all subscriptions
   */
  private stopAllSubscriptions(): void {
    for (const [subscriptionId, interval] of this.activeSubscriptions) {
      clearInterval(interval)
      this.logger.log(`Stopped subscription ${subscriptionId}`)
    }
    this.activeSubscriptions.clear()
  }

  /**
   * Process events for a specific subscription
   */
  private async processSubscriptionEvents(subscription: ContractSubscription): Promise<void> {
    // Get or create checkpoint
    let checkpoint = await this.checkpointRepository.findOne({
      where: { contractAddress: subscription.contractAddress },
    })

    if (!checkpoint) {
      const latestBlock = await this.starknetClient.getLatestBlockNumber()
      checkpoint = this.checkpointRepository.create({
        contractAddress: subscription.contractAddress,
        lastProcessedBlock: subscription.fromBlock || latestBlock - BigInt(100), // Start from 100 blocks ago if no fromBlock
        lastProcessedAt: new Date(),
      })
      checkpoint = await this.checkpointRepository.save(checkpoint)
    }

    const latestBlock = await this.starknetClient.getLatestBlockNumber()
    const fromBlock = checkpoint.lastProcessedBlock + BigInt(1)
    const toBlock = latestBlock

    if (fromBlock > toBlock) {
      // No new blocks to process
      return
    }

    this.logger.debug(`Processing events for ${subscription.contractAddress} from block ${fromBlock} to ${toBlock}`)

    try {
      // Get events from StarkNet
      const events = await this.starknetClient.getEvents(subscription.contractAddress, fromBlock, toBlock)

      // Filter events based on subscription criteria
      const filteredEvents = this.filterEvents(events, subscription)

      if (filteredEvents.length > 0) {
        // Process events
        const results = await this.eventProcessor.processBatch(filteredEvents)

        const successCount = results.filter((r) => r.success).length
        const failureCount = results.filter((r) => !r.success).length

        this.logger.log(
          `Processed ${successCount} events successfully, ${failureCount} failed for contract ${subscription.contractAddress}`,
        )

        // Update checkpoint
        checkpoint.lastProcessedBlock = toBlock
        checkpoint.lastProcessedAt = new Date()
        checkpoint.totalEventsProcessed += successCount
        checkpoint.failedEventsCount += failureCount

        // Update processing stats
        const avgProcessingTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length
        checkpoint.processingStats = {
          averageProcessingTime: avgProcessingTime,
          lastBatchSize: filteredEvents.length,
          errorRate: failureCount / results.length,
        }

        await this.checkpointRepository.save(checkpoint)

        // Update subscription
        subscription.lastProcessedBlock = toBlock
        await this.contractSubscriptionRepository.save(subscription)
      } else {
        // Update checkpoint even if no events found
        checkpoint.lastProcessedBlock = toBlock
        checkpoint.lastProcessedAt = new Date()
        await this.checkpointRepository.save(checkpoint)
      }
    } catch (error) {
      this.logger.error(`Failed to process events for subscription ${subscription.id}`, error)
      throw error
    }
  }

  /**
   * Filter events based on subscription criteria
   */
  private filterEvents(events: any[], subscription: ContractSubscription): any[] {
    return events.filter((event) => {
      // Filter by event types
      if (subscription.eventTypes.length > 0) {
        const eventType = this.mapEventNameToType(event.eventName)
        if (!subscription.eventTypes.includes(eventType)) {
          return false
        }
      }

      // Apply additional filter criteria
      if (subscription.filterCriteria) {
        // Implement custom filtering logic based on filterCriteria
        // This is a simplified example
        for (const [key, value] of Object.entries(subscription.filterCriteria)) {
          if (event.decodedData && event.decodedData[key] !== value) {
            return false
          }
        }
      }

      return true
    })
  }

  /**
   * Handle subscription errors
   */
  private async handleSubscriptionError(subscription: ContractSubscription, error: any): Promise<void> {
    subscription.status = SubscriptionStatus.ERROR
    subscription.lastError = error.message
    subscription.lastErrorAt = new Date()
    await this.contractSubscriptionRepository.save(subscription)

    // Stop the subscription to prevent continuous errors
    await this.stopSubscription(subscription.id)

    this.logger.error(`Subscription ${subscription.id} encountered an error and was stopped`, error)
  }

  /**
   * Scheduled task to retry failed subscriptions
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedSubscriptions(): Promise<void> {
    if (this.isShuttingDown) return

    const failedSubscriptions = await this.contractSubscriptionRepository.find({
      where: {
        status: SubscriptionStatus.ERROR,
        isActive: true,
      },
    })

    for (const subscription of failedSubscriptions) {
      // Only retry if the last error was more than 5 minutes ago
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      if (subscription.lastErrorAt && subscription.lastErrorAt > fiveMinutesAgo) {
        continue
      }

      this.logger.log(`Retrying failed subscription ${subscription.id}`)
      try {
        await this.startSubscription(subscription.id)
      } catch (error) {
        this.logger.error(`Failed to retry subscription ${subscription.id}`, error)
      }
    }
  }

  /**
   * Scheduled task to recover missed events
   */
  @Cron(CronExpression.EVERY_HOUR)
  async recoverMissedEvents(): Promise<void> {
    if (this.isShuttingDown) return

    this.logger.log("Starting missed event recovery...")

    const subscriptions = await this.contractSubscriptionRepository.find({
      where: { isActive: true },
    })

    for (const subscription of subscriptions) {
      try {
        await this.recoverMissedEventsForSubscription(subscription)
      } catch (error) {
        this.logger.error(`Failed to recover missed events for subscription ${subscription.id}`, error)
      }
    }
  }

  /**
   * Recover missed events for a specific subscription
   */
  private async recoverMissedEventsForSubscription(subscription: ContractSubscription): Promise<void> {
    const checkpoint = await this.checkpointRepository.findOne({
      where: { contractAddress: subscription.contractAddress },
    })

    if (!checkpoint) return

    const latestBlock = await this.starknetClient.getLatestBlockNumber()
    const expectedBlock = checkpoint.lastProcessedBlock + BigInt(1)

    // Check if there's a gap in processed blocks
    if (expectedBlock < latestBlock - BigInt(10)) {
      // Allow for some delay
      this.logger.log(
        `Recovering missed events for ${subscription.contractAddress} from block ${expectedBlock} to ${latestBlock}`,
      )

      // Process missed events in chunks
      const chunkSize = BigInt(100)
      for (let fromBlock = expectedBlock; fromBlock <= latestBlock; fromBlock += chunkSize) {
        const toBlock =
          fromBlock + chunkSize - BigInt(1) > latestBlock ? latestBlock : fromBlock + chunkSize - BigInt(1)

        try {
          const events = await this.starknetClient.getEvents(subscription.contractAddress, fromBlock, toBlock)

          const filteredEvents = this.filterEvents(events, subscription)
          if (filteredEvents.length > 0) {
            await this.eventProcessor.processBatch(filteredEvents)
            this.logger.log(`Recovered ${filteredEvents.length} missed events from blocks ${fromBlock}-${toBlock}`)
          }
        } catch (error) {
          this.logger.error(`Failed to recover events from blocks ${fromBlock}-${toBlock}`, error)
        }
      }
    }
  }

  /**
   * Map event name to EventType (helper method)
   */
  private mapEventNameToType(eventName: string): string {
    const eventTypeMap: Record<string, string> = {
      delivery_confirmed: "DELIVERY_CONFIRMED",
      escrow_released: "ESCROW_RELEASED",
      escrow_created: "ESCROW_CREATED",
      payment_processed: "PAYMENT_PROCESSED",
      shipment_created: "SHIPMENT_CREATED",
      dispute_raised: "DISPUTE_RAISED",
      dispute_resolved: "DISPUTE_RESOLVED",
      contract_deployed: "CONTRACT_DEPLOYED",
    }

    return eventTypeMap[eventName] || "SHIPMENT_CREATED"
  }
}
