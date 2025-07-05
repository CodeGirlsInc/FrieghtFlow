import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { BadRequestException } from "@nestjs/common"
import { RedemptionService } from "../services/redemption.service"
import { RewardsEngineService } from "../services/rewards-engine.service"
import { Redemption, RedemptionStatus, RedemptionType } from "../entities/redemption.entity"
import type { RedemptionRequestDto } from "../dto/redemption-request.dto"
import { jest } from "@jest/globals"

describe("RedemptionService", () => {
  let service: RedemptionService
  let redemptionRepository: Repository<Redemption>
  let rewardsEngineService: RewardsEngineService

  const mockRedemptionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  const mockRewardsEngineService = {
    getRewardBalance: jest.fn(),
    deductPoints: jest.fn(),
    adjustPoints: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedemptionService,
        {
          provide: getRepositoryToken(Redemption),
          useValue: mockRedemptionRepository,
        },
        {
          provide: RewardsEngineService,
          useValue: mockRewardsEngineService,
        },
      ],
    }).compile()

    service = module.get<RedemptionService>(RedemptionService)
    redemptionRepository = module.get<Repository<Redemption>>(getRepositoryToken(Redemption))
    rewardsEngineService = module.get<RewardsEngineService>(RewardsEngineService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("createRedemption", () => {
    it("should create redemption successfully", async () => {
      const request: RedemptionRequestDto = {
        userId: "user-123",
        redemptionType: RedemptionType.DISCOUNT_COUPON,
        itemName: "10% Discount Coupon",
        pointsRequired: 500,
        itemDescription: "10% off your next purchase",
        monetaryValue: 25.0,
      }

      const mockBalance = {
        userId: "user-123",
        availablePoints: 1000,
        totalPoints: 1000,
        redeemedPoints: 0,
        lifetimePoints: 1000,
        currentTier: "BRONZE" as any,
        tierProgress: 50,
        multiplier: 1.0,
        completedShipments: 5,
        positiveReviews: 3,
        nextTier: { nextTier: null, requiredPoints: 0, pointsNeeded: 0 },
      }

      const mockRedemption = {
        id: "redemption-123",
        userId: "user-123",
        redemptionType: RedemptionType.DISCOUNT_COUPON,
        pointsRequired: 500,
        pointsUsed: 500,
        itemName: "10% Discount Coupon",
        status: RedemptionStatus.PENDING,
        couponCode: "DISC123ABC",
      }

      mockRewardsEngineService.getRewardBalance.mockResolvedValue(mockBalance)
      mockRewardsEngineService.deductPoints.mockResolvedValue(undefined)
      mockRedemptionRepository.create.mockReturnValue(mockRedemption)
      mockRedemptionRepository.save.mockResolvedValue(mockRedemption)

      const result = await service.createRedemption(request)

      expect(result).toEqual(mockRedemption)
      expect(mockRewardsEngineService.deductPoints).toHaveBeenCalledWith("user-123", 500, expect.any(String))
      expect(mockRedemptionRepository.save).toHaveBeenCalled()
    })

    it("should throw error for insufficient points", async () => {
      const request: RedemptionRequestDto = {
        userId: "user-123",
        redemptionType: RedemptionType.DISCOUNT_COUPON,
        itemName: "10% Discount Coupon",
        pointsRequired: 1500,
      }

      const mockBalance = {
        userId: "user-123",
        availablePoints: 1000,
        totalPoints: 1000,
        redeemedPoints: 0,
        lifetimePoints: 1000,
        currentTier: "BRONZE" as any,
        tierProgress: 50,
        multiplier: 1.0,
        completedShipments: 5,
        positiveReviews: 3,
        nextTier: { nextTier: null, requiredPoints: 0, pointsNeeded: 0 },
      }

      mockRewardsEngineService.getRewardBalance.mockResolvedValue(mockBalance)

      await expect(service.createRedemption(request)).rejects.toThrow(BadRequestException)
    })
  })

  describe("approveRedemption", () => {
    it("should approve pending redemption", async () => {
      const mockRedemption = {
        id: "redemption-123",
        status: RedemptionStatus.PENDING,
      }

      mockRedemptionRepository.findOne.mockResolvedValue(mockRedemption)
      mockRedemptionRepository.save.mockResolvedValue({
        ...mockRedemption,
        status: RedemptionStatus.APPROVED,
      })

      const result = await service.approveRedemption("redemption-123")

      expect(result.status).toBe(RedemptionStatus.APPROVED)
      expect(mockRedemptionRepository.save).toHaveBeenCalled()
    })

    it("should throw error for non-pending redemption", async () => {
      const mockRedemption = {
        id: "redemption-123",
        status: RedemptionStatus.FULFILLED,
      }

      mockRedemptionRepository.findOne.mockResolvedValue(mockRedemption)

      await expect(service.approveRedemption("redemption-123")).rejects.toThrow(BadRequestException)
    })
  })

  describe("cancelRedemption", () => {
    it("should cancel redemption and refund points", async () => {
      const mockRedemption = {
        id: "redemption-123",
        userId: "user-123",
        status: RedemptionStatus.PENDING,
        pointsUsed: 500,
        itemName: "Test Item",
      }

      mockRedemptionRepository.findOne.mockResolvedValue(mockRedemption)
      mockRedemptionRepository.save.mockResolvedValue({
        ...mockRedemption,
        status: RedemptionStatus.CANCELLED,
      })
      mockRewardsEngineService.adjustPoints.mockResolvedValue(undefined)

      const result = await service.cancelRedemption("redemption-123", true)

      expect(result.status).toBe(RedemptionStatus.CANCELLED)
      expect(mockRewardsEngineService.adjustPoints).toHaveBeenCalledWith(
        "user-123",
        500,
        expect.stringContaining("Refund for cancelled redemption"),
      )
    })

    it("should not allow cancelling fulfilled redemption", async () => {
      const mockRedemption = {
        id: "redemption-123",
        status: RedemptionStatus.FULFILLED,
      }

      mockRedemptionRepository.findOne.mockResolvedValue(mockRedemption)

      await expect(service.cancelRedemption("redemption-123")).rejects.toThrow(BadRequestException)
    })
  })

  describe("getRedemptionStatistics", () => {
    it("should return redemption statistics", async () => {
      const mockRedemptions = [
        {
          redemptionType: RedemptionType.DISCOUNT_COUPON,
          status: RedemptionStatus.FULFILLED,
          pointsUsed: 500,
        },
        {
          redemptionType: RedemptionType.FREE_SHIPPING,
          status: RedemptionStatus.PENDING,
          pointsUsed: 200,
        },
      ]

      mockRedemptionRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRedemptions),
      })

      const result = await service.getRedemptionStatistics("user-123")

      expect(result.totalRedemptions).toBe(2)
      expect(result.totalPointsRedeemed).toBe(700)
      expect(result.redemptionsByType[RedemptionType.DISCOUNT_COUPON]).toBe(1)
      expect(result.redemptionsByStatus[RedemptionStatus.FULFILLED]).toBe(1)
    })
  })
})
