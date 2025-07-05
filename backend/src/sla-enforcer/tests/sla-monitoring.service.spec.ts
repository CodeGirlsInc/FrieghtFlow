import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { SLAMonitoringService } from "../services/sla-monitoring.service"
import { SLAActionService } from "../services/sla-action.service"
import { SLARule, SLAType, SLAPriority } from "../entities/sla-rule.entity"
import { Shipment, ShipmentStatus, ShipmentPriority } from "../entities/shipment.entity"
import { SLAViolation, ViolationStatus } from "../entities/sla-violation.entity"
import { jest } from "@jest/globals"

describe("SLAMonitoringService", () => {
  let service: SLAMonitoringService
  let slaRuleRepository: Repository<SLARule>
  let shipmentRepository: Repository<Shipment>
  let slaViolationRepository: Repository<SLAViolation>
  let slaActionService: SLAActionService

  const mockSLARuleRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockShipmentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockSLAViolationRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockSLAActionService = {
    executeViolationActions: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SLAMonitoringService,
        {
          provide: getRepositoryToken(SLARule),
          useValue: mockSLARuleRepository,
        },
        {
          provide: getRepositoryToken(Shipment),
          useValue: mockShipmentRepository,
        },
        {
          provide: getRepositoryToken(SLAViolation),
          useValue: mockSLAViolationRepository,
        },
        {
          provide: SLAActionService,
          useValue: mockSLAActionService,
        },
      ],
    }).compile()

    service = module.get<SLAMonitoringService>(SLAMonitoringService)
    slaRuleRepository = module.get<Repository<SLARule>>(getRepositoryToken(SLARule))
    shipmentRepository = module.get<Repository<Shipment>>(getRepositoryToken(Shipment))
    slaViolationRepository = module.get<Repository<SLAViolation>>(getRepositoryToken(SLAViolation))
    slaActionService = module.get<SLAActionService>(SLAActionService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("monitorAllShipments", () => {
    it("should return empty array when no active rules exist", async () => {
      mockSLARuleRepository.find.mockResolvedValue([])

      const result = await service.monitorAllShipments()

      expect(result).toEqual([])
      expect(mockSLARuleRepository.find).toHaveBeenCalledWith({ where: { isActive: true } })
    })

    it("should monitor shipments for active rules", async () => {
      const mockRule: SLARule = {
        id: "rule-1",
        name: "Test Rule",
        ruleType: SLAType.DELIVERY_TIME,
        priority: SLAPriority.MEDIUM,
        thresholdMinutes: 4320, // 3 days
        gracePeriodMinutes: 60,
        isActive: true,
        actions: { alertEmails: ["test@example.com"] },
        conditions: {},
        description: "Test rule",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockShipment: Shipment = {
        id: "shipment-1",
        trackingNumber: "TEST001",
        customerId: "customer-1",
        origin: "New York",
        destination: "Los Angeles",
        status: ShipmentStatus.IN_TRANSIT,
        priority: ShipmentPriority.STANDARD,
        expectedDeliveryAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day overdue
        actualDeliveryAt: null,
        pickedUpAt: new Date(),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockShipment]),
      }

      mockSLARuleRepository.find.mockResolvedValue([mockRule])
      mockShipmentRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.monitorAllShipments()

      expect(result).toHaveLength(1)
      expect(result[0].shipmentId).toBe("shipment-1")
      expect(result[0].ruleId).toBe("rule-1")
      expect(result[0].isViolated).toBe(true)
    })
  })

  describe("getViolationSummary", () => {
    it("should return correct violation summary", async () => {
      const mockViolations = [
        {
          id: "violation-1",
          delayMinutes: 120,
          status: ViolationStatus.DETECTED,
          rule: { priority: SLAPriority.HIGH, ruleType: SLAType.DELIVERY_TIME },
        },
        {
          id: "violation-2",
          delayMinutes: 60,
          status: ViolationStatus.RESOLVED,
          rule: { priority: SLAPriority.MEDIUM, ruleType: SLAType.PICKUP_TIME },
        },
      ]

      const mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockViolations),
      }

      mockSLAViolationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder)

      const result = await service.getViolationSummary()

      expect(result.totalViolations).toBe(2)
      expect(result.activeViolations).toBe(1)
      expect(result.resolvedViolations).toBe(1)
      expect(result.averageDelayMinutes).toBe(90)
      expect(result.violationsByPriority.high).toBe(1)
      expect(result.violationsByType.delivery_time).toBe(1)
    })
  })
})
