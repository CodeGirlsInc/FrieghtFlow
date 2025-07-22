import { Test, type TestingModule } from "@nestjs/testing"
import { WebhooksController } from "../webhooks.controller"
import { WebhooksService } from "../webhooks.service"
import { WebhookStatus } from "../entities/webhook-event.entity"
import { BadRequestException } from "@nestjs/common"
import { jest } from "@jest/globals"

describe("WebhooksController", () => {
  let controller: WebhooksController
  let service: WebhooksService

  const mockService = {
    processWebhook: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    getWebhookStats: jest.fn(),
    retryFailedEvent: jest.fn(),
  }

  const mockWebhookEvent = {
    id: "webhook-123",
    source: "github",
    eventType: "push",
    eventId: "delivery-123",
    payload: { ref: "refs/heads/main" },
    headers: { "x-github-event": "push" },
    status: WebhookStatus.PROCESSED,
    signatureValid: true,
    createdAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: WebhooksService,
          useValue: mockService,
        },
      ],
    }).compile()

    controller = module.get<WebhooksController>(WebhooksController)
    service = module.get<WebhooksService>(WebhooksService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("handleWebhook", () => {
    it("should handle a webhook successfully", async () => {
      const body = { ref: "refs/heads/main" }
      const headers = { "x-github-event": "push" }
      const mockRequest = {
        connection: { remoteAddress: "192.168.1.1" },
        headers: {},
        socket: {},
      } as any

      mockService.processWebhook.mockResolvedValue(mockWebhookEvent)

      const result = await controller.handleWebhook("github", body, headers, mockRequest)

      expect(result).toEqual({
        success: true,
        eventId: "webhook-123",
      })
      expect(service.processWebhook).toHaveBeenCalledWith("github", JSON.stringify(body), headers, "192.168.1.1")
    })

    it("should handle webhook with invalid signature", async () => {
      const body = { ref: "refs/heads/main" }
      const headers = { "x-github-event": "push" }
      const mockRequest = {
        connection: { remoteAddress: "192.168.1.1" },
        headers: {},
        socket: {},
      } as any

      const invalidEvent = { ...mockWebhookEvent, signatureValid: false }
      mockService.processWebhook.mockResolvedValue(invalidEvent)

      const result = await controller.handleWebhook("github", body, headers, mockRequest)

      expect(result).toEqual({
        success: false,
        eventId: "webhook-123",
      })
    })
  })

  describe("getWebhookEvents", () => {
    it("should return paginated webhook events", async () => {
      const filterDto = { source: "github", page: 1, limit: 10 }
      const expectedResult = {
        data: [mockWebhookEvent],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

      mockService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.getWebhookEvents(filterDto)

      expect(result).toEqual(expectedResult)
      expect(service.findAll).toHaveBeenCalledWith(filterDto)
    })
  })

  describe("getWebhookEvent", () => {
    it("should return a specific webhook event", async () => {
      mockService.findOne.mockResolvedValue(mockWebhookEvent)

      const result = await controller.getWebhookEvent("webhook-123")

      expect(result).toEqual(mockWebhookEvent)
      expect(service.findOne).toHaveBeenCalledWith("webhook-123")
    })

    it("should throw BadRequestException for non-existent event", async () => {
      mockService.findOne.mockResolvedValue(null)

      await expect(controller.getWebhookEvent("non-existent")).rejects.toThrow(BadRequestException)
    })
  })

  describe("getWebhookStats", () => {
    it("should return webhook statistics", async () => {
      const expectedStats = {
        totalEvents: 100,
        successfulEvents: 80,
        failedEvents: 15,
        pendingEvents: 5,
        eventsBySource: [{ source: "github", count: 60 }],
        recentActivity: new Date(),
      }

      mockService.getWebhookStats.mockResolvedValue(expectedStats)

      const result = await controller.getWebhookStats("github")

      expect(result).toEqual(expectedStats)
      expect(service.getWebhookStats).toHaveBeenCalledWith("github")
    })
  })

  describe("retryWebhookEvent", () => {
    it("should retry a failed webhook event", async () => {
      const retriedEvent = { ...mockWebhookEvent, status: WebhookStatus.RETRYING }
      mockService.retryFailedEvent.mockResolvedValue(retriedEvent)

      const result = await controller.retryWebhookEvent("webhook-123")

      expect(result).toEqual(retriedEvent)
      expect(service.retryFailedEvent).toHaveBeenCalledWith("webhook-123")
    })
  })
})
