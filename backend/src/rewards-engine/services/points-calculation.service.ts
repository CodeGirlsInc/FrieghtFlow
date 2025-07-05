import { Injectable, Logger } from "@nestjs/common"
import { RewardSource, TierLevel } from "../entities/reward-transaction.entity"
import type { RewardCalculationResult, RewardRule } from "../interfaces/rewards.interface"
import type { TierManagementService } from "./tier-management.service"

@Injectable()
export class PointsCalculationService {
  private readonly logger = new Logger(PointsCalculationService.name)
  private rewardRules: Map<RewardSource, RewardRule> = new Map()

  constructor(private tierManagementService: TierManagementService) {
    this.initializeRewardRules()
  }

  async calculateRewards(
    source: RewardSource,
    userTier: TierLevel,
    customPoints?: number,
    metadata?: Record<string, any>,
  ): Promise<RewardCalculationResult> {
    const rule = this.rewardRules.get(source)

    if (!rule) {
      throw new Error(`No reward rule found for source: ${source}`)
    }

    // Use custom points if provided, otherwise use rule base points
    const basePoints = customPoints ?? rule.basePoints

    // Apply source-specific bonuses
    const bonusPoints = this.calculateSourceBonus(source, basePoints, metadata)

    // Get tier multiplier
    const tierConfig = await this.tierManagementService.getTierConfiguration(userTier)
    const multiplier = tierConfig?.pointsMultiplier || 1.0

    // Calculate tier bonus (additional points for higher tiers)
    const tierBonus = this.calculateTierBonus(userTier, basePoints)

    // Calculate total points
    const totalPoints = Math.round((basePoints + bonusPoints + tierBonus) * multiplier)

    return {
      basePoints,
      bonusPoints,
      totalPoints,
      multiplier,
      tierBonus,
    }
  }

  private calculateSourceBonus(source: RewardSource, basePoints: number, metadata?: Record<string, any>): number {
    let bonus = 0

    switch (source) {
      case RewardSource.POSITIVE_REVIEW:
        // Bonus based on rating
        if (metadata?.rating) {
          const rating = Number(metadata.rating)
          if (rating === 5)
            bonus = basePoints * 0.5 // 50% bonus for 5-star reviews
          else if (rating === 4) bonus = basePoints * 0.25 // 25% bonus for 4-star reviews
        }
        break

      case RewardSource.SHIPMENT_COMPLETED:
        // Bonus for express or premium shipments
        if (metadata?.shipmentType === "express") bonus = basePoints * 0.3
        else if (metadata?.shipmentType === "premium") bonus = basePoints * 0.5

        // Bonus for high-value shipments
        if (metadata?.value) {
          const value = Number(metadata.value)
          if (value > 1000) bonus += basePoints * 0.4
          else if (value > 500) bonus += basePoints * 0.2
        }
        break

      case RewardSource.REFERRAL:
        // Fixed high bonus for referrals
        bonus = basePoints * 1.0 // 100% bonus
        break

      case RewardSource.SPECIAL_PROMOTION:
        // Variable bonus based on promotion type
        if (metadata?.promotionMultiplier) {
          bonus = basePoints * (Number(metadata.promotionMultiplier) - 1)
        }
        break
    }

    return Math.round(bonus)
  }

  private calculateTierBonus(tier: TierLevel, basePoints: number): number {
    const tierBonuses = {
      [TierLevel.BRONZE]: 0,
      [TierLevel.SILVER]: basePoints * 0.1,
      [TierLevel.GOLD]: basePoints * 0.2,
      [TierLevel.PLATINUM]: basePoints * 0.3,
      [TierLevel.DIAMOND]: basePoints * 0.5,
    }

    return Math.round(tierBonuses[tier] || 0)
  }

  private initializeRewardRules(): void {
    const rules: Array<[RewardSource, RewardRule]> = [
      [
        RewardSource.SHIPMENT_COMPLETED,
        {
          source: RewardSource.SHIPMENT_COMPLETED,
          basePoints: 50,
          maxPointsPerDay: 500,
          cooldownHours: 0,
        },
      ],
      [
        RewardSource.POSITIVE_REVIEW,
        {
          source: RewardSource.POSITIVE_REVIEW,
          basePoints: 100,
          maxPointsPerDay: 300,
          cooldownHours: 24,
        },
      ],
      [
        RewardSource.REFERRAL,
        {
          source: RewardSource.REFERRAL,
          basePoints: 500,
          maxPointsPerDay: 2000,
          cooldownHours: 0,
        },
      ],
      [
        RewardSource.TIER_BONUS,
        {
          source: RewardSource.TIER_BONUS,
          basePoints: 0, // Variable based on tier
          maxPointsPerDay: undefined,
          cooldownHours: 0,
        },
      ],
      [
        RewardSource.SPECIAL_PROMOTION,
        {
          source: RewardSource.SPECIAL_PROMOTION,
          basePoints: 200,
          maxPointsPerDay: 1000,
          cooldownHours: 0,
        },
      ],
    ]

    for (const [source, rule] of rules) {
      this.rewardRules.set(source, rule)
    }

    this.logger.log(`Initialized ${rules.length} reward rules`)
  }

  getRewardRule(source: RewardSource): RewardRule | undefined {
    return this.rewardRules.get(source)
  }

  getAllRewardRules(): Map<RewardSource, RewardRule> {
    return new Map(this.rewardRules)
  }
}
