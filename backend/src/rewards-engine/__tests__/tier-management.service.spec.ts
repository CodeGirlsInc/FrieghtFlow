import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { TierManagementService } from "../services/tier-management.service"
import { TierConfiguration } from "../entities/tier-configuration.entity"
import { UserReward, TierLevel } from "../entities/user-reward.entity"
import { jest } from "@jest/globals"

describe("TierManagementService", () => {
  let service: TierManagementService
  let tierConfigRepository: Repository<TierConfiguration>
  let userRewardRepository: Repository<UserReward>

  const mockTierConfigRepository = {
    count: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockUserRewardRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TierManagementService,
        {
          provide: getRepositoryToken(TierConfiguration),
          useValue: mockTierConfigRepository,
        },
        {
          provide: getRepositoryToken(UserReward),
          useValue: mockUserRewardRepository,
        },
      ],
    }).compile()

    service = module.get<TierManagementService>(TierManagementService)
    tierConfigRepository = module.get<Repository<TierConfiguration>>(getRepositoryToken(TierConfiguration))
    userRewardRepository = module.get<Repository<UserReward>>(getRepositoryToken(UserReward))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("calculateTierLevel", () => {
    beforeEach(() => {
      const mockConfigs = [
        { tier: TierLevel.BRONZE, requiredPoints: 0, requiredShipments: 0, isActive: true },
        { tier: TierLevel.SILVER, requiredPoints: 1000, requiredShipments: 5, isActive: true },
        { tier: TierLevel.GOLD, requiredPoints: 2500, requiredShipments: 15, isActive: true },
      ]

      mockTierConfigRepository.count.mockResolvedValue(3)
      mockTierConfigRepository.find.mockResolvedValue(mockConfigs)
    })

    it("should return BRONZE for new users", async () => {
      const tier = await service.calculateTierLevel(0, 0)
      expect(tier).toBe(TierLevel.BRONZE)
    })

    it("should return SILVER for qualifying users", async () => {
      const tier = await service.calculateTierLevel(1200, 6)
      expect(tier).toBe(TierLevel.SILVER)
    })

    it("should return GOLD for high-tier users", async () => {
      const tier = await service.calculateTierLevel(3000, 20)
      expect(tier).toBe(TierLevel.GOLD)
    })

    it("should require both points and shipments for tier upgrade", async () => {
      // Has points but not enough shipments
      let tier = await service.calculateTierLevel(1200, 3)
      expect(tier).toBe(TierLevel.BRONZE)

      // Has shipments but not enough points
      tier = await service.calculateTierLevel(500, 10)
      expect(tier).toBe(TierLevel.BRONZE)
    })
  })

  describe("updateUserTier", () => {
    it("should upgrade user tier and apply welcome bonus", async () => {
      const mockUser = {
        userId: "user-123",
        lifetimePoints: 1200,
        completedShipments: 6,
        currentTier: TierLevel.BRONZE,
        availablePoints: 1200,
        totalPoints: 1200,
      }

      const mockTierConfig = {
        tier: TierLevel.SILVER,
        pointsMultiplier: 1.2,
        welcomeBonus: 100,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(mockUser)
      mockTierConfigRepository.count.mockResolvedValue(3)
      mockTierConfigRepository.find.mockResolvedValue([
        { tier: TierLevel.BRONZE, requiredPoints: 0, requiredShipments: 0, isActive: true },
        { tier: TierLevel.SILVER, requiredPoints: 1000, requiredShipments: 5, isActive: true },
      ])

      // Mock the tier cache
      service["tierCache"].set(TierLevel.SILVER, mockTierConfig as any)
      service["isCacheInitialized"] = true

      const result = await service.updateUserTier("user-123")

      expect(result.tierChanged).toBe(true)
      expect(result.newTier).toBe(TierLevel.SILVER)
      expect(result.welcomeBonus).toBe(100)
      expect(mockUserRewardRepository.save).toHaveBeenCalled()
    })

    it("should not change tier if requirements not met", async () => {
      const mockUser = {
        userId: "user-123",
        lifetimePoints: 500,
        completedShipments: 2,
        currentTier: TierLevel.BRONZE,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(mockUser)
      mockTierConfigRepository.count.mockResolvedValue(1)
      mockTierConfigRepository.find.mockResolvedValue([
        { tier: TierLevel.BRONZE, requiredPoints: 0, requiredShipments: 0, isActive: true },
      ])

      service["isCacheInitialized"] = true

      const result = await service.updateUserTier("user-123")

      expect(result.tierChanged).toBe(false)
      expect(result.newTier).toBe(TierLevel.BRONZE)
      expect(result.welcomeBonus).toBe(0)
    })
  })

  describe("getNextTierInfo", () => {
    beforeEach(() => {
      const mockConfigs = [
        { tier: TierLevel.SILVER, requiredPoints: 1000, requiredShipments: 5 },
        { tier: TierLevel.GOLD, requiredPoints: 2500, requiredShipments: 15 },
      ]

      service["tierCache"].set(TierLevel.SILVER, mockConfigs[0] as any)
      service["tierCache"].set(TierLevel.GOLD, mockConfigs[1] as any)
      service["isCacheInitialized"] = true
    })

    it("should return next tier info for BRONZE user", async () => {
      const result = await service.getNextTierInfo(TierLevel.BRONZE, 500)

      expect(result.nextTier).toBe(TierLevel.SILVER)
      expect(result.requiredPoints).toBe(1000)
      expect(result.pointsNeeded).toBe(500)
    })

    it("should return null for DIAMOND users", async () => {
      const result = await service.getNextTierInfo(TierLevel.DIAMOND, 10000)

      expect(result.nextTier).toBeNull()
      expect(result.requiredPoints).toBe(0)
      expect(result.pointsNeeded).toBe(0)
    })
  })
})
