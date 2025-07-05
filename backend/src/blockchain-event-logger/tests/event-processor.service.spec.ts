import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { EventProcessorService } from "../services/event-processor.service"
import { StarkNetClientService } from "../services/starknet-client.service"
import { BlockchainEvent, EventStatus, EventType } from "../entities/blockchain-event.entity"
import type { StarkNetEventData } from "../interfaces/blockchain-event-logger.interface"
import { jest } from "@jest/globals"

describe("EventProcessorService", () => {
  let service: EventProcessorService
  let blockchainEventRepository: Repository<BlockchainEvent>
  let starknetClient: StarkNetClientService

  const mockBlockchainEventRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockStarkNetClient = {
    getBlock: jest.fn(),
    decodeEventData: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventProcessorService,
        {
          provide: getRepositoryToken(BlockchainEvent),
          useValue: mockBlockchainEventRepository,
        },
        {
          provide: StarkNetClientService,
          useValue: mockStarkNetClient,
        },
      ],
    }).compile()

    service = module.get<EventProcessorService>(EventProcessorService)
    blockchainEventRepository = module.get<Repository<BlockchainEvent>>(getRepositoryToken(BlockchainEvent))
    starknetClient = module.get<StarkNetClientService>(StarkNetClientService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("processEvent", () => {
    const mockEventData: StarkNetEventData = {
      transactionHash: "0x123",
      contractAddress: "0x456",
      eventName: "delivery_confirmed",
      blockNumber: BigInt(12345),
      blockTimestamp: new Date(),
      logIndex: 0,
      data: ["0x789", "1640995200", "0xabc"],
      keys: ["0x99cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9"],
    }

    it("should process a new event successfully", async () => {
      const mockDecodedData = {
        shipmentId: "0x789",
        deliveryTimestamp: "1640995200",
        recipient: "0xabc",
      }

      const mockBlockchainEvent = {
        id: "event-1",
        transactionHash: "0x123",
        contractAddress: "0x456",
        eventType: EventType.DELIVERY_CONFIRMED,
        blockNumber: BigInt(12345),
        logIndex: 0,
        eventData: {
          data: mockEventData.data,
          keys: mockEventData.keys,
          eventName: "delivery_confirmed",
        },
        decodedData: mockDecodedData,
        status: EventStatus.PROCESSED,
      }

      mockBlockchainEventRepository.findOne.mockResolvedValue(null) // No existing event
      mockStarkNetClient.getBlock.mockResolvedValue({
        timestamp: new Date(),
        number: BigInt(12345),
      })
      mockStarkNetClient.decodeEventData.mockReturnValue(mockDecodedData)
      mockBlockchainEventRepository.create.mockReturnValue(mockBlockchainEvent)
      mockBlockchainEventRepository.save.mockResolvedValue(mockBlockchainEvent)

      const result = await service.processEvent(mockEventData)

      expect(result).toEqual(mockBlockchainEvent)
      expect(mockBlockchainEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionHash: "0x123",
          contractAddress: "0x456",
          eventType: EventType.DELIVERY_CONFIRMED,
          status: EventStatus.PROCESSED,
        }),
      )
    })

    it("should return existing event if already processed", async () => {
      const existingEvent = { id: "existing-event" }
      mockBlockchainEventRepository.findOne.mockResolvedValue(existingEvent)

      const result = await service.processEvent(mockEventData)

      expect(result).toEqual(existingEvent)
      expect(mockBlockchainEventRepository.create).not.toHaveBeenCalled()
    })

    it("should handle block timestamp fetch failure gracefully", async () => {
      mockBlockchainEventRepository.findOne.mockResolvedValue(null)
      mockStarkNetClient.getBlock.mockRejectedValue(new Error("Block not found"))
      mockStarkNetClient.decodeEventData.mockReturnValue({})
      mockBlockchainEventRepository.create.mockReturnValue({})
      mockBlockchainEventRepository.save.mockResolvedValue({ id: "event-1" })

      await service.processEvent(mockEventData)

      expect(mockBlockchainEventRepository.save).toHaveBeenCalled()
    })
  })

  describe("processBatch", () => {
    it("should process multiple events and return results", async () => {
      const mockEvents: StarkNetEventData[] = [
        {
          transactionHash: "0x123",
          contractAddress: "0x456",
          eventName: "delivery_confirmed",
          blockNumber: BigInt(12345),
          blockTimestamp: new Date(),
          logIndex: 0,
          data: [],
          keys: [],
        },
        {
          transactionHash: "0x124",
          contractAddress: "0x456",
          eventName: "escrow_released",
          blockNumber: BigInt(12346),
          blockTimestamp: new Date(),
          logIndex: 0,
          data: [],
          keys: [],
        },
      ]

      // Mock successful processing for first event
      mockBlockchainEventRepository.findOne.mockResolvedValueOnce(null)
      mockStarkNetClient.getBlock.mockResolvedValue({ timestamp: new Date(), number: BigInt(12345) })
      mockStarkNetClient.decodeEventData.mockReturnValue({})
      mockBlockchainEventRepository.create.mockReturnValue({})
      mockBlockchainEventRepository.save.mockResolvedValueOnce({ id: "event-1" })

      // Mock failure for second event
      mockBlockchainEventRepository.findOne.mockResolvedValueOnce(null)
      mockBlockchainEventRepository.save.mockRejectedValueOnce(new Error("Database error"))

      const results = await service.processBatch(mockEvents)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[1].error).toBe("Database error")
    })
  })

  describe("retryFailedEvents", () => {
    it("should retry failed events within retry limit", async () => {
      const failedEvent = {
        id: "failed-event-1",
        retryCount: 1,
        status: EventStatus.FAILED,
        eventData: {
          eventName: "delivery_confirmed",
          data: [],
          keys: [],
        },
      }

      mockBlockchainEventRepository.find.mockResolvedValue([failedEvent])
      mockBlockchainEventRepository.save.mockResolvedValue(failedEvent)
      mockStarkNetClient.decodeEventData.mockReturnValue({})

      const results = await service.retryFailedEvents(3)

      expect(results).toHaveLength(1)
      expect(results[0].success).toBe(true)
      expect(mockBlockchainEventRepository.save).toHaveBeenCalledTimes(2) // Once for retry status, once for success
    })

    it("should skip events that exceeded max retries", async () => {
      const failedEvent = {
        id: "failed-event-1",
        retryCount: 5,
        status: EventStatus.FAILED,
      }

      mockBlockchainEventRepository.find.mockResolvedValue([failedEvent])

      const results = await service.retryFailedEvents(3)

      expect(results).toHaveLength(0)
      expect(mockBlockchainEventRepository.save).not.toHaveBeenCalled()
    })
  })

  describe("getProcessingStats", () => {
    it("should return processing statistics", async () => {
      mockBlockchainEventRepository.count
        .mockResolvedValueOnce(1000) // total
        .mockResolvedValueOnce(950) // processed
        .mockResolvedValueOnce(30) // failed
        .mockResolvedValueOnce(20) // pending

      mockBlockchainEventRepository.find.mockResolvedValue([
        { metadata: { processingTime: 100 } },
        { metadata: { processingTime: 200 } },
        { metadata: {} }, // No processing time
      ])

      const stats = await service.getProcessingStats()

      expect(stats).toEqual({
        totalEvents: 1000,
        processedEvents: 950,
        failedEvents: 30,
        pendingEvents: 20,
        averageProcessingTime: 100, // (100 + 200 + 0) / 3
      })
    })
  })

  describe("cleanupOldEvents", () => {
    it("should delete old processed events", async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 50 }),
      }

      mockBlockchainEventRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.cleanupOldEvents(30)

      expect(result).toBe(50)
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
      expect(mockQueryBuilder.where).toHaveBeenCalledWith("status = :status", { status: EventStatus.PROCESSED })
    })
  })
})
