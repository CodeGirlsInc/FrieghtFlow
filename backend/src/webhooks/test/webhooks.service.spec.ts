import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { EventEmitter2 } from "@nestjs/event-emitter"
import type { Repository } from "typeorm"
import { WebhooksService } from "../webhooks.service"
import { WebhookEvent, WebhookStatus } from "../entities/webhook-event.entity"
import { WebhookSourceRegistry } from "../webhook-source.registry"
import { BadRequestException } from "@nestjs/common"
import { jest } from "@jest/globals"

describe("WebhooksService", () => {
  let service: WebhooksService
  let repository: Repository<WebhookEvent>
  let eventEmitter: EventEmitter2
  let sourceRegistry: WebhookSourceRegistry

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockEventEmitter = {
    emit: jest.fn(),
  }

  const mockSourceRegistry = {
    isValidSource: jest.fn(),
    getSourceConfig: jest.fn(),
    getValidator: jest.fn(),
  }

  const mockWebhookEvent: WebhookEvent = {
    id: "webhook-123",
    source: "github",
    eventType: "push",
    eventId: "delivery-123",
    payload: { ref: "refs/heads/main" },
    headers: { "x-github-event": "push" },
    status: WebhookStatus.PENDING,
    processingAttempts: 0,
    lastError: null,
    processedAt: null,
    signatureValid: true,
    ipAddress: "192.168.1.1",
    userAgent: "GitHub-Hookshot/abc123",
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhooksService,
        {
          provide: getRepositoryToken(WebhookEvent),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: WebhookSourceRegistry,
          useValue: mockSourceRegistry,
        },
      ],
    }).compile()

    service = module.get<WebhooksService>(WebhooksService)
    repository = module.get<Repository<WebhookEvent>>(getRepositoryToken(WebhookEvent))
    eventEmitter = module.get<EventEmitter2>(EventEmitter2)
    sourceRegistry = module.get<WebhookSourceRegistry>(WebhookSourceRegistry)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("processWebhook", () => {
    const validPayload = JSON.stringify({ ref: "refs/heads/main" })
    const headers = {
      "x-github-event": "push",
      "x-github-delivery": "delivery-123",
      "x-hub-signature-256": "sha256=valid-signature",
    }

    beforeEach(() => {
      mockSourceRegistry.isValidSource.mockReturnValue(true)
      mockSourceRegistry.getSourceConfig.mockReturnValue({
        name: "GitHub",
        secretKey: "secret",
        signatureHeader: "x-hub-signature-256",
        validateSignature: true,
      })
      mockSourceRegistry.getValidator.mockReturnValue({
        validateSignature: jest.fn().mockReturnValue(true),
        extractEventInfo: jest.fn().mockReturnValue({
          eventType: "push",
          eventId: "delivery-123",
        }),
        validateEventType: jest.fn().mockReturnValue(true),
      })
    })

    it("should process a valid webhook", async () => {
      mockRepository.create.mockReturnValue(mockWebhookEvent)
      mockRepository.save.mockResolvedValue(mockWebhookEvent)
      mockRepository.update.mockResolvedValue({ affected: 1 })

      const result = await service.processWebhook("github", validPayload, headers, "192.168.1.1")

      expect(result.source).toBe("github")
      expect(result.eventType).toBe("push")
      expect(result.signatureValid).toBe(true)
      expect(mockEventEmitter.emit).toHaveBeenCalledWith("webhook.github.push", expect.any(Object))
    })

    it("should throw BadRequestException for unknown source", async () => {
      mockSourceRegistry.isValidSource.mockReturnValue(false)

      await expect(service.processWebhook("unknown", validPayload, headers)).rejects.toThrow(BadRequestException)
    })

    it("should throw BadRequestException for invalid JSON", async () => {
      await expect(service.processWebhook("github", "invalid-json", headers)).rejects.toThrow(BadRequestException)
    })

    it("should handle webhook with invalid signature", async () => {
      const validator = mockSourceRegistry.getValidator()
      validator.validateSignature.mockReturnValue(false)

      const invalidEvent = { ...mockWebhookEvent, signatureValid: false, status: WebhookStatus.FAILED }
      mockRepository.create.mockReturnValue(invalidEvent)
      mockRepository.save.mockResolvedValue(invalidEvent)

      const result = await service.processWebhook("github", validPayload, headers)

      expect(result.signatureValid).toBe(false)
      expect(result.status).toBe(WebhookStatus.FAILED)
      expect(mockEventEmitter.emit).not.toHaveBeenCalled()
    })
  })

  describe("validateWebhook", () => {
    const payload = { ref: "refs/heads/main" }
    const headers = { "x-github-event": "push" }

    beforeEach(() => {
      mockSourceRegistry.getSourceConfig.mockReturnValue({
        name: "GitHub",
        secretKey: "secret",
        signatureHeader: "x-hub-signature-256",
        validateSignature: true,
      })
      mockSourceRegistry.getValidator.mockReturnValue({
        validateSignature: jest.fn().mockReturnValue(true),
        extractEventInfo: jest.fn().mockReturnValue({
          eventType: "push",
          eventId: "delivery-123",
        }),
        validateEventType: jest.fn().mockReturnValue(true),
      })
    })

    it("should validate a correct webhook", async () => {
      const result = await service.validateWebhook("github", JSON.stringify(payload), headers, payload)

      expect(result.isValid).toBe(true)
      expect(result.eventType).toBe("push")
      expect(result.eventId).toBe("delivery-123")
    })

    it("should fail validation for missing event type", async () => {
      const validator = mockSourceRegistry.getValidator()
      validator.extractEventInfo.mockReturnValue({ eventType: null, eventId: null })

      const result = await service.validateWebhook("github", JSON.stringify(payload), headers, payload)

      expect(result.isValid).toBe(false)
      expect(result.error).toBe("Event type not found")
    })

    it("should fail validation for invalid event type", async () => {
      const validator = mockSourceRegistry.getValidator()
      validator.validateEventType.mockReturnValue(false)

      const result = await service.validateWebhook("github", JSON.stringify(payload), headers, payload)

      expect(result.isValid).toBe(false)
      expect(result.error).toContain("Event type 'push' not allowed")
    })
  })

  describe("findAll", () => {
    it("should return paginated webhook events", async () => {
      const filterDto = {
        source: "github",
        page: 1,
        limit: 10,
      }

      mockRepository.findAndCount.mockResolvedValue([[mockWebhookEvent], 1])

      const result = await service.findAll(filterDto)

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(10)
    })
  })

  describe("getWebhookStats", () => {
    it("should return webhook statistics", async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        clone: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      }

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      mockQueryBuilder.getCount
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // successful
        .mockResolvedValueOnce(15) // failed
        .mockResolvedValueOnce(5) // pending

      mockQueryBuilder.getRawMany.mockResolvedValue([
        { source: "github", count: "60" },
        { source: "stripe", count: "40" },
      ])

      mockQueryBuilder.getRawOne.mockResolvedValue({
        lastActivity: "2023-01-01T00:00:00Z",
      })

      const result = await service.getWebhookStats()

      expect(result).toEqual({
        totalEvents: 100,
        successfulEvents: 80,
        failedEvents: 15,
        pendingEvents: 5,
        eventsBySource: [
          { source: "github", count: 60 },
          { source: "stripe", count: 40 },
        ],
        recentActivity: new Date("2023-01-01T00:00:00Z"),
      })
    })
  })

  describe("retryFailedEvent", () => {
    it("should retry a failed webhook event", async () => {
      const failedEvent = { ...mockWebhookEvent, status: WebhookStatus.FAILED }
      mockRepository.findOne.mockResolvedValue(failedEvent)
      mockRepository.update.mockResolvedValue({ affected: 1 })

      const result = await service.retryFailedEvent("webhook-123")

      expect(mockRepository.update).toHaveBeenCalledWith("webhook-123", {
        status: WebhookStatus.RETRYING,
      })
      expect(mockEventEmitter.emit).toHaveBeenCalled()
    })

    it("should throw error for non-existent event", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.retryFailedEvent("non-existent")).rejects.toThrow(BadRequestException)
    })

    it("should throw error for non-failed event", async () => {
      const processedEvent = { ...mockWebhookEvent, status: WebhookStatus.PROCESSED }
      mockRepository.findOne.mockResolvedValue(processedEvent)

      await expect(service.retryFailedEvent("webhook-123")).rejects.toThrow(BadRequestException)
    })
  })
})
