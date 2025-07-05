import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { EventSubscriptionService } from "../services/event-subscription.service"
import { StarkNetClientService } from "../services/starknet-client.service"
import { EventProcessorService } from "../services/event-processor.service"
import { ContractSubscription, SubscriptionStatus } from "../entities/contract-subscription.entity"
import { EventProcessingCheckpoint } from "../entities/event-processing-checkpoint.entity"
import { EventType } from "../entities/blockchain-event.entity"
import type { CreateSubscriptionDto } from "../dto/create-subscription.dto"
import { jest } from "@jest/globals"

describe("EventSubscriptionService", () => {
  let service: EventSubscriptionService
  let contractSubscriptionRepository: Repository<ContractSubscription>
  let checkpointRepository: Repository<EventProcessingCheckpoint>
  let starknetClient: StarkNetClientService
  let eventProcessor: EventProcessorService

  const mockContractSubscriptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  }

  const mockCheckpointRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockStarkNetClient = {
    getLatestBlockNumber: jest.fn(),
    getEvents: jest.fn(),
  }

  const mockEventProcessor = {
    processBatch: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventSubscriptionService,
        {
          provide: getRepositoryToken(ContractSubscription),
          useValue: mockContractSubscriptionRepository,
        },
        {
          provide: getRepositoryToken(EventProcessingCheckpoint),
          useValue: mockCheckpointRepository,
        },
        {
          provide: StarkNetClientService,
          useValue: mockStarkNetClient,
        },
        {
          provide: EventProcessorService,
          useValue: mockEventProcessor,
        },
      ],
    }).compile()

    service = module.get<EventSubscriptionService>(EventSubscriptionService)
    contractSubscriptionRepository = module.get<Repository<ContractSubscription>>(
      getRepositoryToken(ContractSubscription),
    )
    checkpointRepository = module.get<Repository<EventProcessingCheckpoint>>(
      getRepositoryToken(EventProcessingCheckpoint),
    )
    starknetClient = module.get<StarkNetClientService>(StarkNetClientService)
    eventProcessor = module.get<EventProcessorService>(EventProcessorService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("createSubscription", () => {
    const createSubscriptionDto: CreateSubscriptionDto = {
      name: "Test Subscription",
      contractAddress: "0x123",
      eventTypes: [EventType.DELIVERY_CONFIRMED, EventType.ESCROW_RELEASED],
      description: "Test subscription for unit tests",
    }

    it("should create a new subscription successfully", async () => {
      const mockSubscription = {
        id: "sub-1",
        ...createSubscriptionDto,
        status: SubscriptionStatus.ACTIVE,
        isActive: true,
      }

      mockContractSubscriptionRepository.create.mockReturnValue(mockSubscription)
      mockContractSubscriptionRepository.save.mockResolvedValue(mockSubscription)

      // Mock startSubscription to avoid actual subscription start
      jest.spyOn(service, "startSubscription").mockResolvedValue()

      const result = await service.createSubscription(createSubscriptionDto)

      expect(result).toEqual(mockSubscription)
      expect(mockContractSubscriptionRepository.create).toHaveBeenCalledWith(createSubscriptionDto)
      expect(service.startSubscription).toHaveBeenCalledWith("sub-1")
    })

    it("should create subscription without starting if inactive", async () => {
      const inactiveDto = { ...createSubscriptionDto, isActive: false }
      const mockSubscription = {
        id: "sub-1",
        ...inactiveDto,
        status: SubscriptionStatus.STOPPED,
      }

      mockContractSubscriptionRepository.create.mockReturnValue(mockSubscription)
      mockContractSubscriptionRepository.save.mockResolvedValue(mockSubscription)

      jest.spyOn(service, "startSubscription").mockResolvedValue()

      const result = await service.createSubscription(inactiveDto)

      expect(result).toEqual(mockSubscription)
      expect(service.startSubscription).not.toHaveBeenCalled()
    })
  })

  describe("updateSubscription", () => {
    it("should update subscription and restart if active", async () => {
      const existingSubscription = {
        id: "sub-1",
        name: "Old Name",
        isActive: true,
        status: SubscriptionStatus.ACTIVE,
      }

      const updateDto = { name: "New Name" }

      mockContractSubscriptionRepository.findOne.mockResolvedValue(existingSubscription)
      mockContractSubscriptionRepository.save.mockResolvedValue({
        ...existingSubscription,
        ...updateDto,
      })

      jest.spyOn(service, "restartSubscription").mockResolvedValue()

      const result = await service.updateSubscription("sub-1", updateDto)

      expect(result.name).toBe("New Name")
      expect(service.restartSubscription).toHaveBeenCalledWith("sub-1")
    })

    it("should throw error for non-existent subscription", async () => {
      mockContractSubscriptionRepository.findOne.mockResolvedValue(null)

      await expect(service.updateSubscription("non-existent", {})).rejects.toThrow("Subscription not found")
    })
  })

  describe("getAllSubscriptions", () => {
    it("should return all subscriptions ordered by creation date", async () => {
      const mockSubscriptions = [
        { id: "sub-1", name: "Subscription 1" },
        { id: "sub-2", name: "Subscription 2" },
      ]

      mockContractSubscriptionRepository.find.mockResolvedValue(mockSubscriptions)

      const result = await service.getAllSubscriptions()

      expect(result).toEqual(mockSubscriptions)
      expect(mockContractSubscriptionRepository.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
      })
    })
  })

  describe("deleteSubscription", () => {
    it("should stop and delete subscription", async () => {
      jest.spyOn(service, "stopSubscription").mockResolvedValue()
      mockContractSubscriptionRepository.delete.mockResolvedValue({ affected: 1 })

      await service.deleteSubscription("sub-1")

      expect(service.stopSubscription).toHaveBeenCalledWith("sub-1")
      expect(mockContractSubscriptionRepository.delete).toHaveBeenCalledWith("sub-1")
    })
  })

  describe("startSubscription", () => {
    it("should start monitoring for a subscription", async () => {
      const mockSubscription = {
        id: "sub-1",
        contractAddress: "0x123",
        status: SubscriptionStatus.STOPPED,
      }

      mockContractSubscriptionRepository.findOne.mockResolvedValue(mockSubscription)
      mockContractSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.ACTIVE,
      })

      // Mock the private method processSubscriptionEvents
      jest.spyOn(service as any, "processSubscriptionEvents").mockResolvedValue()

      await service.startSubscription("sub-1")

      expect(mockContractSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: SubscriptionStatus.ACTIVE }),
      )
    })

    it("should warn if subscription is already active", async () => {
      const mockSubscription = { id: "sub-1" }
      mockContractSubscriptionRepository.findOne.mockResolvedValue(mockSubscription)

      // Simulate active subscription
      ;(service as any).activeSubscriptions.set(
        "sub-1",
        setTimeout(() => {}, 1000),
      )

      const loggerSpy = jest.spyOn((service as any).logger, "warn")

      await service.startSubscription("sub-1")

      expect(loggerSpy).toHaveBeenCalledWith("Subscription sub-1 is already active")
    })
  })

  describe("stopSubscription", () => {
    it("should stop monitoring and update status", async () => {
      const mockSubscription = {
        id: "sub-1",
        status: SubscriptionStatus.ACTIVE,
      }

      // Simulate active subscription
      const mockInterval = setTimeout(() => {}, 1000)
      ;(service as any).activeSubscriptions.set("sub-1", mockInterval)

      mockContractSubscriptionRepository.findOne.mockResolvedValue(mockSubscription)
      mockContractSubscriptionRepository.save.mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.STOPPED,
      })

      await service.stopSubscription("sub-1")

      expect((service as any).activeSubscriptions.has("sub-1")).toBe(false)
      expect(mockContractSubscriptionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: SubscriptionStatus.STOPPED }),
      )
    })
  })

  describe("retryFailedSubscriptions", () => {
    it("should retry failed subscriptions after delay", async () => {
      const failedSubscription = {
        id: "sub-1",
        status: SubscriptionStatus.ERROR,
        isActive: true,
        lastErrorAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      }

      mockContractSubscriptionRepository.find.mockResolvedValue([failedSubscription])
      jest.spyOn(service, "startSubscription").mockResolvedValue()

      await service.retryFailedSubscriptions()

      expect(service.startSubscription).toHaveBeenCalledWith("sub-1")
    })

    it("should skip recently failed subscriptions", async () => {
      const recentlyFailedSubscription = {
        id: "sub-1",
        status: SubscriptionStatus.ERROR,
        isActive: true,
        lastErrorAt: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      }

      mockContractSubscriptionRepository.find.mockResolvedValue([recentlyFailedSubscription])
      jest.spyOn(service, "startSubscription").mockResolvedValue()

      await service.retryFailedSubscriptions()

      expect(service.startSubscription).not.toHaveBeenCalled()
    })
  })
})
