import { Injectable, Logger, NotFoundException, BadRequestException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { UserReward } from "../entities/user-reward.entity"
import { type RewardTransaction, TransactionType, RewardSource } from "../entities/reward-transaction.entity"
import type { PointsCalculationService } from "./points-calculation.service"
import type { TierManagementService } from "./tier-management.service"
import type { PointsTransaction } from "../interfaces/rewards.interface"
import type { RewardEventDto } from "../dto/reward-event.dto"
import type { RewardBalanceDto } from "../dto/reward-balance.dto"

@Injectable()
export class RewardsEngineService {
  private readonly logger = new Logger(RewardsEngineService.name)

  constructor(
    private userRewardRepository: Repository<UserReward>,
    private rewardTransactionRepository: Repository<RewardTransaction>,
    private pointsCalculationService: PointsCalculationService,
    private tierManagementService: TierManagementService,
  ) {}

  async processRewardEvent(eventDto: RewardEventDto): Promise<{
    pointsAwarded: number
    newBalance: number
    tierChanged: boolean
    newTier: string
  }> {
    this.logger.log(`Processing reward event for user ${eventDto.userId}, source: ${eventDto.source}`)

    // Get or create user reward record
    let userReward = await this.userRewardRepository.findOne({ where: { userId: eventDto.userId } })

    if (!userReward) {
      userReward = await this.createUserReward(eventDto.userId)
    }

    // Check for cooldown and daily limits
    await this.validateRewardConstraints(eventDto.userId, eventDto.source)

    // Calculate reward points
    const calculation = await this.pointsCalculationService.calculateRewards(
      eventDto.source,
      userReward.currentTier,
      eventDto.customPoints,
      eventDto.metadata,
    )

    // Update user reward record
    const balanceBefore = userReward.availablePoints
    userReward.availablePoints += calculation.totalPoints
    userReward.totalPoints += calculation.totalPoints
    userReward.lifetimePoints += calculation.totalPoints
    userReward.lastActivityDate = new Date()

    // Update activity counters
    if (eventDto.source === RewardSource.SHIPMENT_COMPLETED) {
      userReward.completedShipments += 1
    } else if (eventDto.source === RewardSource.POSITIVE_REVIEW) {
      userReward.positiveReviews += 1
    }

    await this.userRewardRepository.save(userReward)

    // Create transaction record
    await this.createTransaction(
      {
        userId: eventDto.userId,
        transactionType: TransactionType.EARNED,
        source: eventDto.source,
        points: calculation.totalPoints,
        referenceId: eventDto.referenceId,
        description: this.generateTransactionDescription(eventDto.source, calculation),
        metadata: {
          ...eventDto.metadata,
          calculation,
        },
      },
      balanceBefore,
      userReward.availablePoints,
    )

    // Check for tier upgrade
    const tierUpdate = await this.tierManagementService.updateUserTier(eventDto.userId)

    if (tierUpdate.tierChanged && tierUpdate.welcomeBonus > 0) {
      // Create separate transaction for tier welcome bonus
      await this.createTransaction(
        {
          userId: eventDto.userId,
          transactionType: TransactionType.EARNED,
          source: RewardSource.TIER_BONUS,
          points: tierUpdate.welcomeBonus,
          description: `Welcome bonus for reaching ${tierUpdate.newTier} tier`,
        },
        userReward.availablePoints - tierUpdate.welcomeBonus,
        userReward.availablePoints,
      )
    }

    return {
      pointsAwarded: calculation.totalPoints,
      newBalance: userReward.availablePoints,
      tierChanged: tierUpdate.tierChanged,
      newTier: tierUpdate.newTier,
    }
  }

  async getRewardBalance(userId: string): Promise<RewardBalanceDto> {
    const userReward = await this.userRewardRepository.findOne({ where: { userId } })

    if (!userReward) {
      throw new NotFoundException(`Reward balance not found for user: ${userId}`)
    }

    const nextTierInfo = await this.tierManagementService.getNextTierInfo(
      userReward.currentTier,
      userReward.lifetimePoints,
    )

    const tierProgress = await this.tierManagementService.getTierProgress(userId)

    return {
      userId: userReward.userId,
      availablePoints: userReward.availablePoints,
      totalPoints: userReward.totalPoints,
      redeemedPoints: userReward.redeemedPoints,
      lifetimePoints: userReward.lifetimePoints,
      currentTier: userReward.currentTier,
      tierProgress: Math.round(tierProgress),
      multiplier: userReward.multiplier,
      completedShipments: userReward.completedShipments,
      positiveReviews: userReward.positiveReviews,
      nextTier: nextTierInfo,
    }
  }

  async getTransactionHistory(userId: string, limit = 50): Promise<RewardTransaction[]> {
    return this.rewardTransactionRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async deductPoints(userId: string, points: number, source: RewardSource, referenceId?: string): Promise<void> {
    const userReward = await this.userRewardRepository.findOne({ where: { userId } })

    if (!userReward) {
      throw new NotFoundException(`User reward record not found: ${userId}`)
    }

    if (userReward.availablePoints < points) {
      throw new BadRequestException(
        `Insufficient points. Available: ${userReward.availablePoints}, Required: ${points}`,
      )
    }

    const balanceBefore = userReward.availablePoints
    userReward.availablePoints -= points
    userReward.redeemedPoints += points

    await this.userRewardRepository.save(userReward)

    await this.createTransaction(
      {
        userId,
        transactionType: TransactionType.REDEEMED,
        source,
        points: -points, // Negative for deduction
        referenceId,
        description: `Points redeemed for ${source}`,
      },
      balanceBefore,
      userReward.availablePoints,
    )
  }

  async adjustPoints(userId: string, points: number, reason: string): Promise<void> {
    const userReward = await this.userRewardRepository.findOne({ where: { userId } })

    if (!userReward) {
      throw new NotFoundException(`User reward record not found: ${userId}`)
    }

    const balanceBefore = userReward.availablePoints
    userReward.availablePoints += points

    if (points > 0) {
      userReward.totalPoints += points
      userReward.lifetimePoints += points
    }

    await this.userRewardRepository.save(userReward)

    await this.createTransaction(
      {
        userId,
        transactionType: points > 0 ? TransactionType.EARNED : TransactionType.REDEEMED,
        source: RewardSource.MANUAL_ADJUSTMENT,
        points,
        description: reason,
      },
      balanceBefore,
      userReward.availablePoints,
    )
  }

  private async createUserReward(userId: string): Promise<UserReward> {
    const userReward = this.userRewardRepository.create({
      userId,
      totalPoints: 0,
      availablePoints: 0,
      redeemedPoints: 0,
      lifetimePoints: 0,
      completedShipments: 0,
      positiveReviews: 0,
      multiplier: 1.0,
    })

    return this.userRewardRepository.save(userReward)
  }

  private async createTransaction(
    transaction: PointsTransaction,
    balanceBefore: number,
    balanceAfter: number,
  ): Promise<RewardTransaction> {
    const rewardTransaction = this.rewardTransactionRepository.create({
      ...transaction,
      balanceBefore,
      balanceAfter,
    })

    return this.rewardTransactionRepository.save(rewardTransaction)
  }

  private async validateRewardConstraints(userId: string, source: RewardSource): Promise<void> {
    const rule = this.pointsCalculationService.getRewardRule(source)

    if (!rule) return

    // Check daily limits
    if (rule.maxPointsPerDay) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayTransactions = await this.rewardTransactionRepository
        .createQueryBuilder("transaction")
        .where("transaction.userId = :userId", { userId })
        .andWhere("transaction.source = :source", { source })
        .andWhere("transaction.transactionType = :type", { type: TransactionType.EARNED })
        .andWhere("transaction.createdAt >= :today", { today })
        .getMany()

      const todayPoints = todayTransactions.reduce((sum, t) => sum + t.points, 0)

      if (todayPoints >= rule.maxPointsPerDay) {
        throw new BadRequestException(`Daily limit reached for ${source}. Limit: ${rule.maxPointsPerDay}`)
      }
    }

    // Check cooldown
    if (rule.cooldownHours && rule.cooldownHours > 0) {
      const cooldownTime = new Date()
      cooldownTime.setHours(cooldownTime.getHours() - rule.cooldownHours)

      const recentTransaction = await this.rewardTransactionRepository.findOne({
        where: {
          userId,
          source,
          transactionType: TransactionType.EARNED,
        },
        order: { createdAt: "DESC" },
      })

      if (recentTransaction && recentTransaction.createdAt > cooldownTime) {
        throw new BadRequestException(`Cooldown active for ${source}. Try again later.`)
      }
    }
  }

  private generateTransactionDescription(source: RewardSource, calculation: any): string {
    const descriptions = {
      [RewardSource.SHIPMENT_COMPLETED]: `Shipment completed (+${calculation.totalPoints} points)`,
      [RewardSource.POSITIVE_REVIEW]: `Positive review submitted (+${calculation.totalPoints} points)`,
      [RewardSource.REFERRAL]: `Friend referral bonus (+${calculation.totalPoints} points)`,
      [RewardSource.TIER_BONUS]: `Tier achievement bonus (+${calculation.totalPoints} points)`,
      [RewardSource.SPECIAL_PROMOTION]: `Special promotion bonus (+${calculation.totalPoints} points)`,
      [RewardSource.REDEMPTION]: `Points redeemed`,
      [RewardSource.EXPIRATION]: `Points expired`,
      [RewardSource.MANUAL_ADJUSTMENT]: `Manual adjustment`,
    }

    return descriptions[source] || `Reward earned (+${calculation.totalPoints} points)`
  }
}
