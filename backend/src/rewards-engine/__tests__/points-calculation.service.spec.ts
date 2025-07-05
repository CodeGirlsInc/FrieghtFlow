import { Test, type TestingModule } from "@nestjs/testing"
import { PointsCalculationService } from "../services/points-calculation.service"
import { TierManagementService } from "../services/tier-management.service"
import { RewardSource } from "../entities/reward-transaction.entity"
import { TierLevel } from "../entities/user-reward.entity"
import { jest } from "@jest/globals"

describe("PointsCalculationService", () => {
  let service: PointsCalculationService
  let tierService: TierManagementService

  const mockTierService = {
    getTierConfiguration: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PointsCalculationService,
        {
          provide: TierManagementService,
          useValue: mockTierService,
        },
      ],
    }).compile()

    service = module.get<PointsCalculationService>(PointsCalculationService)
    tierService = module.get<TierManagementService>(TierManagementService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("calculateRewards", () => {
    it("should calculate basic shipment completion rewards", async () => {
      mockTierService.getTierConfiguration.mockResolvedValue({
        pointsMultiplier: 1.0,
      })

      const result = await service.calculateRewards(RewardSource.SHIPMENT_COMPLETED, TierLevel.BRONZE)

      expect(result.basePoints).toBe(50)
      expect(result.bonusPoints).toBe(0)
      expect(result.tierBonus).toBe(0)
      expect(result.multiplier).toBe(1.0)
      expect(result.totalPoints).toBe(50)
    })

    it("should apply tier multiplier for higher tiers", async () => {
      mockTierService.getTierConfiguration.mockResolvedValue({
        pointsMultiplier: 1.5,
      })

      const result = await service.calculateRewards(RewardSource.SHIPMENT_COMPLETED, TierLevel.GOLD)

      expect(result.basePoints).toBe(50)
      expect(result.tierBonus).toBe(10) // 20% of base points for GOLD
      expect(result.multiplier).toBe(1.5)
      expect(result.totalPoints).toBe(90) // (50 + 10) * 1.5
    })

    it("should apply rating bonus for positive reviews", async () => {
      mockTierService.getTierConfiguration.mockResolvedValue({
        pointsMultiplier: 1.0,
      })

      const result = await service.calculateRewards(RewardSource.POSITIVE_REVIEW, TierLevel.BRONZE, undefined, {
        rating: 5,
      })

      expect(result.basePoints).toBe(100)
      expect(result.bonusPoints).toBe(50) // 50% bonus for 5-star review
      expect(result.totalPoints).toBe(150)
    })

    it("should handle custom points override", async () => {
      mockTierService.getTierConfiguration.mockResolvedValue({
        pointsMultiplier: 1.0,
      })

      const result = await service.calculateRewards(
        RewardSource.SHIPMENT_COMPLETED,
        TierLevel.BRONZE,
        200, // Custom points
      )

      expect(result.basePoints).toBe(200)
      expect(result.totalPoints).toBe(200)
    })

    it("should apply shipment value bonus", async () => {
      mockTierService.getTierConfiguration.mockResolvedValue({
        pointsMultiplier: 1.0,
      })

      const result = await service.calculateRewards(RewardSource.SHIPMENT_COMPLETED, TierLevel.BRONZE, undefined, {
        value: 1500,
        shipmentType: "express",
      })

      expect(result.basePoints).toBe(50)
      expect(result.bonusPoints).toBe(35) // 30% for express + 40% for high value
      expect(result.totalPoints).toBe(85)
    })
  })

  describe("getRewardRule", () => {
    it("should return reward rule for valid source", () => {
      const rule = service.getRewardRule(RewardSource.SHIPMENT_COMPLETED)

      expect(rule).toBeDefined()
      expect(rule?.basePoints).toBe(50)
      expect(rule?.maxPointsPerDay).toBe(500)
    })

    it("should return undefined for invalid source", () => {
      const rule = service.getRewardRule("INVALID_SOURCE" as RewardSource)
      expect(rule).toBeUndefined()
    })
  })
})
