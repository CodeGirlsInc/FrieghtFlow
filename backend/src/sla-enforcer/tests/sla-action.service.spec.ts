import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { HttpService } from "@nestjs/axios"
import type { Repository } from "typeorm"
import { SLAActionService } from "../services/sla-action.service"
import { SLAViolation, ViolationStatus } from "../entities/sla-violation.entity"
import { SLARule, SLAType, SLAPriority } from "../entities/sla-rule.entity"
import { Shipment, ShipmentStatus } from "../entities/shipment.entity"
import { jest } from "@jest/globals"

describe("SLAActionService", () => {
  let service: SLAActionService
  let slaViolationRepository: Repository<SLAViolation>
  let httpService: HttpService

  const mockSLAViolationRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  }

  const mockHttpService = {
    post: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SLAActionService,
        {
          provide: getRepositoryToken(SLAViolation),
          useValue: mockSLAViolationRepository,
        },
        {
          provide: getRepositoryToken(SLARule),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Shipment),
          useValue: {},
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile()

    service = module.get<SLAActionService>(SLAActionService)
    slaViolationRepository = module.get<Repository<SLAViolation>>(getRepositoryToken(SLAViolation))
    httpService = module.get<HttpService>(HttpService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("executeViolationActions", () => {
    it("should execute all configured actions for a violation", async () => {
      const mockViolation = {
        id: "violation-1",
        shipmentId: "shipment-1",
        ruleId: "rule-1",
        delayMinutes: 120,
        status: ViolationStatus.DETECTED,
        rule: {
          id: "rule-1",
          name: "Test Rule",
          ruleType: SLAType.DELIVERY_TIME,
          priority: SLAPriority.HIGH,
          actions: {
            alertEmails: ["admin@company.com"],
            webhookUrl: "https://api.company.com/webhook",
            penaltyAmount: 100,
          },
        },
        shipment: {
          id: "shipment-1",
          trackingNumber: "TEST001",
          customerId: "customer-1",
          origin: "New York",
          destination: "Los Angeles",
          status: ShipmentStatus.IN_TRANSIT,
          expectedDeliveryAt: new Date(),
        },
      } as any

      mockSLAViolationRepository.findOne.mockResolvedValue(mockViolation)
      mockSLAViolationRepository.save.mockResolvedValue(mockViolation)

      const result = await service.executeViolationActions("violation-1")

      expect(result).toHaveLength(3) // email, webhook, penalty
      expect(result.every((r) => r.success)).toBe(true)
      expect(mockSLAViolationRepository.save).toHaveBeenCalledTimes(2) // processing + resolved
    })

    it("should handle action execution failures gracefully", async () => {
      const mockViolation = {
        id: "violation-1",
        rule: {
          actions: {
            alertEmails: ["invalid-email"],
          },
        },
        shipment: {},
      } as any

      mockSLAViolationRepository.findOne.mockResolvedValue(mockViolation)
      mockSLAViolationRepository.save.mockResolvedValue(mockViolation)

      // Mock email failure
      jest.spyOn(service as any, "sendEmailAlerts").mockRejectedValue(new Error("Email failed"))

      const result = await service.executeViolationActions("violation-1")

      expect(mockViolation.status).toBe(ViolationStatus.ESCALATED)
      expect(mockViolation.notes).toContain("Action execution failed")
    })

    it("should throw error for non-existent violation", async () => {
      mockSLAViolationRepository.findOne.mockResolvedValue(null)

      await expect(service.executeViolationActions("non-existent")).rejects.toThrow(
        "SLA violation not found: non-existent",
      )
    })
  })

  describe("retriggerActions", () => {
    it("should retrigger actions for existing violation", async () => {
      const mockViolation = {
        id: "violation-1",
        rule: { actions: {} },
        shipment: {},
      } as any

      mockSLAViolationRepository.findOne.mockResolvedValue(mockViolation)
      mockSLAViolationRepository.save.mockResolvedValue(mockViolation)

      const result = await service.retriggerActions("violation-1")

      expect(Array.isArray(result)).toBe(true)
      expect(mockSLAViolationRepository.findOne).toHaveBeenCalledWith({
        where: { id: "violation-1" },
        relations: ["rule", "shipment"],
      })
    })
  })
})
