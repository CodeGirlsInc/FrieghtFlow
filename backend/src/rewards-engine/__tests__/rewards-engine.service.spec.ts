import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { RewardsEngineService } from "../services/rewards-engine.service"
import { PointsCalculationService } from "../services/points-calculation.service"
import { TierManagementService } from "../services/tier-management.service"
import { UserReward, TierLevel } from "../entities/user-reward.entity"
import { RewardTransaction, RewardSource } from "../entities/reward-transaction.entity"
import type { RewardEventDto } from "../dto/reward-event.dto"
import { jest } from "@jest/globals"

describe("RewardsEngineService", () => {
  let service: RewardsEngineService
  let userRewardRepository: Repository<UserReward>
  let rewardTransactionRepository: Repository<RewardTransaction>
  let pointsCalculationService: PointsCalculationService
  let tierManagementService: TierManagementService

  const mockUserRewardRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockRewardTransactionRepository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockPointsCalculationService = {
    calculateRewards: jest.fn(),
    getRewardRule: jest.fn(),
  }

  const mockTierManagementService = {
    updateUserTier: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardsEngineService,
        {
          provide: getRepositoryToken(UserReward),
          useValue: mockUserRewardRepository,
        },
        {
          provide: getRepositoryToken(RewardTransaction),
          useValue: mockRewardTransactionRepository,
        },
        {
          provide: PointsCalculationService,
          useValue: mockPointsCalculationService,
        },
        {
          provide: TierManagementService,
          useValue: mockTierManagementService,
        },
      ],
    }).compile()

    service = module.get<RewardsEngineService>(RewardsEngineService)
    userRewardRepository = module.get<Repository<UserReward>>(getRepositoryToken(UserReward))
    rewardTransactionRepository = module.get<Repository<RewardTransaction>>(getRepositoryToken(RewardTransaction))
    pointsCalculationService = module.get<PointsCalculationService>(PointsCalculationService)
    tierManagementService = module.get<TierManagementService>(TierManagementService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("processRewardEvent", () => {
    it("should process shipment completion event for existing user", async () => {
      const eventDto: RewardEventDto = {
        userId: "user-123",
        source: RewardSource.SHIPMENT_COMPLETED,
        referenceId: "shipment-456",
      }

      const mockUser = {
        userId: "user-123",
        availablePoints: 500,
        totalPoints: 500,
        lifetimePoints: 500,
        completedShipments: 5,
        currentTier: TierLevel.BRONZE,
      }

      const mockCalculation = {
        basePoints: 50,
        bonusPoints: 0,
        totalPoints: 50,
        multiplier: 1.0,
        tierBonus: 0,
      }

      const mockTierUpdate = {
        tierChanged: false,
        newTier: TierLevel.BRONZE,
        welcomeBonus: 0,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(mockUser)
      mockPointsCalculationService.getRewardRule.mockReturnValue({ maxPointsPerDay: 500 })
      mockRewardTransactionRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })
      mockPointsCalculationService.calculateRewards.mockResolvedValue(mockCalculation)
      mockUserRewardRepository.save.mockResolvedValue({ ...mockUser, completedShipments: 6 })
      mockRewardTransactionRepository.create.mockReturnValue({})
      mockRewardTransactionRepository.save.mockResolvedValue({})
      mockTierManagementService.updateUserTier.mockResolvedValue(mockTierUpdate)

      const result = await service.processRewardEvent(eventDto)

      expect(result.pointsAwarded).toBe(50)
      expect(result.newBalance).toBe(550)
      expect(result.tierChanged).toBe(false)
      expect(mockUserRewardRepository.save).toHaveBeenCalled()
      expect(mockRewardTransactionRepository.save).toHaveBeenCalled()
    })

    it("should create new user reward record for new user", async () => {
      const eventDto: RewardEventDto = {
        userId: "new-user",
        source: RewardSource.POSITIVE_REVIEW,
        metadata: { rating: 5 },
      }

      const mockCalculation = {
        basePoints: 100,
        bonusPoints: 50,
        totalPoints: 150,
        multiplier: 1.0,
        tierBonus: 0,
      }

      const mockNewUser = {
        userId: "new-user",
        availablePoints: 150,
        totalPoints: 150,
        lifetimePoints: 150,
        positiveReviews: 1,
        currentTier: TierLevel.BRONZE,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(null)
      mockUserRewardRepository.create.mockReturnValue(mockNewUser)
      mockUserRewardRepository.save.mockResolvedValue(mockNewUser)
      mockPointsCalculationService.getRewardRule.mockReturnValue({ maxPointsPerDay: 300 })
      mockRewardTransactionRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })
      mockPointsCalculationService.calculateRewards.mockResolvedValue(mockCalculation)
      mockRewardTransactionRepository.create.mockReturnValue({})
      mockRewardTransactionRepository.save.mockResolvedValue({})
      mockTierManagementService.updateUserTier.mockResolvedValue({
        tierChanged: false,
        newTier: TierLevel.BRONZE,
        welcomeBonus: 0,
      })

      const result = await service.processRewardEvent(eventDto)

      expect(result.pointsAwarded).toBe(150)
      expect(mockUserRewardRepository.create).toHaveBeenCalled()
    })

    it("should handle tier upgrade with welcome bonus", async () => {
      const eventDto: RewardEventDto = {
        userId: "user-123",
        source: RewardSource.SHIPMENT_COMPLETED,
      }

      const mockUser = {
        userId: "user-123",
        availablePoints: 950,
        totalPoints: 950,
        lifetimePoints: 950,
        completedShipments: 4,
        currentTier: TierLevel.BRONZE,
      }

      const mockCalculation = {
        basePoints: 50,
        bonusPoints: 0,
        totalPoints: 50,
        multiplier: 1.0,
        tierBonus: 0,
      }

      const mockTierUpdate = {
        tierChanged: true,
        newTier: TierLevel.SILVER,
        welcomeBonus: 100,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(mockUser)
      mockPointsCalculationService.getRewardRule.mockReturnValue({})
      mockRewardTransactionRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      })
      mockPointsCalculationService.calculateRewards.mockResolvedValue(mockCalculation)
      mockUserRewardRepository.save.mockResolvedValue({ ...mockUser, availablePoints: 1100 })
      mockRewardTransactionRepository.create.mockReturnValue({})
      mockRewardTransactionRepository.save.mockResolvedValue({})
      mockTierManagementService.updateUserTier.mockResolvedValue(mockTierUpdate)

      const result = await service.processRewardEvent(eventDto)

      expect(result.tierChanged).toBe(true)
      expect(result.newTier).toBe(TierLevel.SILVER)
      expect(mockRewardTransactionRepository.save).toHaveBeenCalledTimes(2) // Main reward + tier bonus
    })

    it("should throw error when daily limit exceeded", async () => {
      const eventDto: RewardEventDto = {
        userId: "user-123",
        source: RewardSource.POSITIVE_REVIEW,
      }

      mockUserRewardRepository.findOne.mockResolvedValue({
        userId: "user-123",
        currentTier: TierLevel.BRONZE,
      })
      mockPointsCalculationService.getRewardRule.mockReturnValue({ maxPointsPerDay: 300 })
      mockRewardTransactionRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ points: 200 }, { points: 150 }]),
      })

      await expect(service.processRewardEvent(eventDto)).rejects.toThrow(BadRequestException)
    })
  })

  describe("getRewardBalance", () => {
    it("should return reward balance for existing user", async () => {
      const mockUser = {
        userId: "user-123",
        availablePoints: 1250,
        totalPoints: 2000,
        redeemedPoints: 750,
        lifetimePoints: 2000,
        currentTier: TierLevel.SILVER,
        multiplier: 1.2,
        completedShipments: 10,
        positiveReviews: 8,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(mockUser)
      mockTierManagementService.getNextTierInfo = jest.fn().mockResolvedValue({
        nextTier: TierLevel.GOLD,
        requiredPoints: 2500,
        pointsNeeded: 500,
      })
      mockTierManagementService.getTierProgress = jest.fn().mockResolvedValue(75.5)

      const result = await service.getRewardBalance("user-123")

      expect(result.userId).toBe("user-123")
      expect(result.availablePoints).toBe(1250)
      expect(result.currentTier).toBe(TierLevel.SILVER)
      expect(result.tierProgress).toBe(76) // Rounded
    })

    it("should throw NotFoundException for non-existent user", async () => {
      mockUserRewardRepository.findOne.mockResolvedValue(null)

      await expect(service.getRewardBalance("non-existent")).rejects.toThrow(NotFoundException)
    })
  })

  describe("deductPoints", () => {
    it("should deduct points successfully", async () => {
      const mockUser = {
        userId: "user-123",
        availablePoints: 1000,
        redeemedPoints: 500,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(mockUser)
      mockUserRewardRepository.save.mockResolvedValue({
        ...mockUser,
        availablePoints: 750,
        redeemedPoints: 750,
      })
      mockRewardTransactionRepository.create.mockReturnValue({})
      mockRewardTransactionRepository.save.mockResolvedValue({})

      await service.deductPoints("user-123", 250, RewardSource.REDEMPTION)

      expect(mockUserRewardRepository.save).toHaveBeenCalled()
      expect(mockRewardTransactionRepository.save).toHaveBeenCalled()
    })

    it("should throw error for insufficient points", async () => {
      const mockUser = {
        userId: "user-123",
        availablePoints: 100,
        redeemedPoints: 0,
      }

      mockUserRewardRepository.findOne.mockResolvedValue(mockUser)

      await expect(service.deductPoints("user-123", 250, RewardSource.REDEMPTION)).rejects.toThrow(BadRequestException)
    })
  })

  describe("getTransactionHistory", () => {
    it("should return transaction history", async () => {
      const mockTransactions = [
        {
          id: "1",
          userId: "user-123",
          points: 50,
          source: RewardSource.SHIPMENT_COMPLETED,
          createdAt: new Date(),
        },
      ]

      mockRewardTransactionRepository.find.mockResolvedValue(mockTransactions)

      const result = await service.getTransactionHistory("user-123", 25)

      expect(result).toEqual(mockTransactions)
      expect(mockRewardTransactionRepository.find).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        order: { createdAt: "DESC" },
        take: 25,
      })
    })
  })
})
