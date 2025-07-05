import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Redemption, RedemptionStatus, RedemptionType } from "../entities/redemption.entity"
import type { RewardsEngineService } from "./rewards-engine.service"
import type { RedemptionRequestDto } from "../dto/redemption-request.dto"
import { RewardSource } from "../entities/reward-transaction.entity"

@Injectable()
export class RedemptionService {
  private readonly logger = new Logger(RedemptionService.name)

  constructor(
    private redemptionRepository: Repository<Redemption>,
    private rewardsEngineService: RewardsEngineService,
  ) {}

  async createRedemption(request: RedemptionRequestDto): Promise<Redemption> {
    this.logger.log(`Creating redemption for user ${request.userId}: ${request.itemName}`)

    // Validate user has sufficient points
    const balance = await this.rewardsEngineService.getRewardBalance(request.userId)

    if (balance.availablePoints < request.pointsRequired) {
      throw new BadRequestException(
        `Insufficient points. Available: ${balance.availablePoints}, Required: ${request.pointsRequired}`,
      )
    }

    // Deduct points from user account
    await this.rewardsEngineService.deductPoints(request.userId, request.pointsRequired, RewardSource.REDEMPTION)

    // Create redemption record
    const redemption = this.redemptionRepository.create({
      userId: request.userId,
      redemptionType: request.redemptionType,
      pointsRequired: request.pointsRequired,
      pointsUsed: request.pointsRequired,
      itemName: request.itemName,
      itemDescription: request.itemDescription,
      monetaryValue: request.monetaryValue,
      status: RedemptionStatus.PENDING,
      couponCode: this.generateCouponCode(request.redemptionType),
      expirationDate: this.calculateExpirationDate(request.redemptionType),
    })

    const savedRedemption = await this.redemptionRepository.save(redemption)

    this.logger.log(`Redemption created with ID: ${savedRedemption.id}`)
    return savedRedemption
  }

  async getUserRedemptions(userId: string, limit = 50): Promise<Redemption[]> {
    return this.redemptionRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async getRedemptionById(id: string): Promise<Redemption> {
    const redemption = await this.redemptionRepository.findOne({ where: { id } })

    if (!redemption) {
      throw new NotFoundException(`Redemption not found: ${id}`)
    }

    return redemption
  }

  async approveRedemption(id: string): Promise<Redemption> {
    const redemption = await this.getRedemptionById(id)

    if (redemption.status !== RedemptionStatus.PENDING) {
      throw new BadRequestException(`Cannot approve redemption with status: ${redemption.status}`)
    }

    redemption.status = RedemptionStatus.APPROVED
    return this.redemptionRepository.save(redemption)
  }

  async fulfillRedemption(id: string): Promise<Redemption> {
    const redemption = await this.getRedemptionById(id)

    if (redemption.status !== RedemptionStatus.APPROVED) {
      throw new BadRequestException(`Cannot fulfill redemption with status: ${redemption.status}`)
    }

    redemption.status = RedemptionStatus.FULFILLED
    redemption.fulfilledDate = new Date()

    return this.redemptionRepository.save(redemption)
  }

  async cancelRedemption(id: string, refundPoints = true): Promise<Redemption> {
    const redemption = await this.getRedemptionById(id)

    if (redemption.status === RedemptionStatus.FULFILLED) {
      throw new BadRequestException("Cannot cancel fulfilled redemption")
    }

    redemption.status = RedemptionStatus.CANCELLED

    // Refund points if requested
    if (refundPoints) {
      await this.rewardsEngineService.adjustPoints(
        redemption.userId,
        redemption.pointsUsed,
        `Refund for cancelled redemption: ${redemption.itemName}`,
      )
    }

    return this.redemptionRepository.save(redemption)
  }

  async getRedemptionStatistics(userId?: string): Promise<{
    totalRedemptions: number
    totalPointsRedeemed: number
    redemptionsByType: Record<RedemptionType, number>
    redemptionsByStatus: Record<RedemptionStatus, number>
  }> {
    const queryBuilder = this.redemptionRepository.createQueryBuilder("redemption")

    if (userId) {
      queryBuilder.where("redemption.userId = :userId", { userId })
    }

    const redemptions = await queryBuilder.getMany()

    const stats = {
      totalRedemptions: redemptions.length,
      totalPointsRedeemed: redemptions.reduce((sum, r) => sum + r.pointsUsed, 0),
      redemptionsByType: {} as Record<RedemptionType, number>,
      redemptionsByStatus: {} as Record<RedemptionStatus, number>,
    }

    // Initialize counters
    Object.values(RedemptionType).forEach((type) => {
      stats.redemptionsByType[type] = 0
    })
    Object.values(RedemptionStatus).forEach((status) => {
      stats.redemptionsByStatus[status] = 0
    })

    // Count redemptions by type and status
    redemptions.forEach((redemption) => {
      stats.redemptionsByType[redemption.redemptionType]++
      stats.redemptionsByStatus[redemption.status]++
    })

    return stats
  }

  private generateCouponCode(type: RedemptionType): string {
    const prefix = {
      [RedemptionType.DISCOUNT_COUPON]: "DISC",
      [RedemptionType.FREE_SHIPPING]: "SHIP",
      [RedemptionType.CASH_BACK]: "CASH",
      [RedemptionType.GIFT_CARD]: "GIFT",
      [RedemptionType.MERCHANDISE]: "MERCH",
      [RedemptionType.UPGRADE]: "UPGR",
    }

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix[type]}${randomSuffix}`
  }

  private calculateExpirationDate(type: RedemptionType): Date {
    const expirationDays = {
      [RedemptionType.DISCOUNT_COUPON]: 30,
      [RedemptionType.FREE_SHIPPING]: 60,
      [RedemptionType.CASH_BACK]: 90,
      [RedemptionType.GIFT_CARD]: 365,
      [RedemptionType.MERCHANDISE]: 30,
      [RedemptionType.UPGRADE]: 90,
    }

    const expiration = new Date()
    expiration.setDate(expiration.getDate() + expirationDays[type])
    return expiration
  }
}
