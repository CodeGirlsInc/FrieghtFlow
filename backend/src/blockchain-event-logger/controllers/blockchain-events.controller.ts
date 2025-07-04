import { Controller, Get, Post, Param, Query, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import type { Repository } from "typeorm"
import type { BlockchainEvent } from "../entities/blockchain-event.entity"
import type { EventProcessorService } from "../services/event-processor.service"
import type { QueryEventsDto } from "../dto/query-events.dto"

@ApiTags("Blockchain Events")
@Controller("blockchain-events")
export class BlockchainEventsController {
  constructor(
    private readonly blockchainEventRepository: Repository<BlockchainEvent>,
    private readonly eventProcessor: EventProcessorService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Query blockchain events" })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
  async queryEvents(query: QueryEventsDto): Promise<{
    events: BlockchainEvent[]
    total: number
    page: number
    limit: number
  }> {
    const queryBuilder = this.blockchainEventRepository.createQueryBuilder("event")

    // Apply filters
    if (query.contractAddress) {
      queryBuilder.andWhere("event.contractAddress = :contractAddress", {
        contractAddress: query.contractAddress,
      })
    }

    if (query.eventType) {
      queryBuilder.andWhere("event.eventType = :eventType", { eventType: query.eventType })
    }

    if (query.status) {
      queryBuilder.andWhere("event.status = :status", { status: query.status })
    }

    if (query.transactionHash) {
      queryBuilder.andWhere("event.transactionHash = :transactionHash", {
        transactionHash: query.transactionHash,
      })
    }

    if (query.fromBlock) {
      queryBuilder.andWhere("event.blockNumber >= :fromBlock", { fromBlock: query.fromBlock })
    }

    if (query.toBlock) {
      queryBuilder.andWhere("event.blockNumber <= :toBlock", { toBlock: query.toBlock })
    }

    if (query.fromDate) {
      queryBuilder.andWhere("event.blockTimestamp >= :fromDate", { fromDate: new Date(query.fromDate) })
    }

    if (query.toDate) {
      queryBuilder.andWhere("event.blockTimestamp <= :toDate", { toDate: new Date(query.toDate) })
    }

    // Apply sorting
    queryBuilder.orderBy("event.blockNumber", query.sortOrder || "DESC")
    queryBuilder.addOrderBy("event.logIndex", query.sortOrder || "DESC")

    // Apply pagination
    const total = await queryBuilder.getCount()
    queryBuilder.limit(query.limit || 50)
    queryBuilder.offset(query.offset || 0)

    const events = await queryBuilder.getMany()

    return {
      events,
      total,
      page: Math.floor((query.offset || 0) / (query.limit || 50)) + 1,
      limit: query.limit || 50,
    }
  }

  @Get(":id")
  @ApiOperation({ summary: "Get event by ID" })
  @ApiParam({ name: "id", description: "Event ID" })
  @ApiResponse({ status: 200, description: "Event retrieved successfully" })
  @ApiResponse({ status: 404, description: "Event not found" })
  async getEventById(@Param('id') id: string): Promise<BlockchainEvent> {
    const event = await this.blockchainEventRepository.findOne({ where: { id } })
    if (!event) {
      throw new Error(`Event not found: ${id}`)
    }
    return event
  }

  @Get("transaction/:hash")
  @ApiOperation({ summary: "Get events by transaction hash" })
  @ApiParam({ name: "hash", description: "Transaction hash" })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
  async getEventsByTransaction(@Param('hash') hash: string): Promise<BlockchainEvent[]> {
    return this.blockchainEventRepository.find({
      where: { transactionHash: hash },
      order: { logIndex: "ASC" },
    })
  }

  @Get("contract/:address")
  @ApiOperation({ summary: "Get events by contract address" })
  @ApiParam({ name: "address", description: "Contract address" })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
  async getEventsByContract(
    @Param('address') address: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ): Promise<{
    events: BlockchainEvent[]
    total: number
  }> {
    const [events, total] = await this.blockchainEventRepository.findAndCount({
      where: { contractAddress: address },
      order: { blockNumber: "DESC", logIndex: "DESC" },
      take: Math.min(limit, 1000),
      skip: offset,
    })

    return { events, total }
  }

  @Post("retry-failed")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retry processing failed events" })
  @ApiResponse({ status: 200, description: "Failed events retry initiated" })
  async retryFailedEvents(@Query('maxRetries') maxRetries = 3): Promise<{
    message: string
    results: any[]
  }> {
    const results = await this.eventProcessor.retryFailedEvents(maxRetries)
    return {
      message: `Retried ${results.length} failed events`,
      results,
    }
  }

  @Get("stats/processing")
  @ApiOperation({ summary: "Get event processing statistics" })
  @ApiResponse({ status: 200, description: "Processing stats retrieved successfully" })
  async getProcessingStats(): Promise<{
    totalEvents: number
    processedEvents: number
    failedEvents: number
    pendingEvents: number
    averageProcessingTime: number
  }> {
    return this.eventProcessor.getProcessingStats()
  }

  @Post("cleanup/:days")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Clean up old processed events" })
  @ApiParam({ name: "days", description: "Number of days to keep events" })
  @ApiResponse({ status: 200, description: "Cleanup completed" })
  async cleanupOldEvents(@Param('days') days: number): Promise<{ message: string; deletedCount: number }> {
    const deletedCount = await this.eventProcessor.cleanupOldEvents(days)
    return {
      message: `Cleaned up events older than ${days} days`,
      deletedCount,
    }
  }
}
