import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { TierConfiguration } from "../entities/tier-configuration.entity"
import type { UserReward } from "../entities/user-reward.entity"
import { TierLevel } from "../enums/tier-level.enum" // Import TierLevel

@Injectable()
export class TierManagementService {
  private readonly logger = new Logger(TierManagementService.name)
  private tierCache: Map<TierLevel, TierConfiguration> = new Map()
  private isCacheInitialized = false

  constructor(
    private tierConfigRepository: Repository<TierConfiguration>,
    private userRewardRepository: Repository<UserReward>,
  ) {}

  async initializeTierConfigurations(): Promise<void> {
    const existingConfigs = await this.tierConfigRepository.count()

    if (existingConfigs === 0) {
      await this.seedDefaultTierConfigurations()
    }

    await this.loadTierCache()
  }

  async calculateTierLevel(totalPoints: number, completedShipments: number): Promise<TierLevel> {
    await this.ensureCacheInitialized()

    const tiers = Array.from(this.tierCache.values())
      .filter((config) => config.isActive)
      .sort((a, b) => b.requiredPoints - a.requiredPoints)

    for (const tier of tiers) {
      if (totalPoints >= tier.requiredPoints && completedShipments >= tier.requiredShipments) {
        return tier.tier
      }
    }

    return TierLevel.BRONZE
  }

  async getTierConfiguration(tier: TierLevel): Promise<TierConfiguration | null> {
    await this.ensureCacheInitialized()
    return this.tierCache.get(tier) || null
  }

  async getNextTierInfo(
    currentTier: TierLevel,
    currentPoints: number,
  ): Promise<{
    nextTier: TierLevel | null
    requiredPoints: number
    pointsNeeded: number
  }> {
    await this.ensureCacheInitialized()

    const tierOrder = [TierLevel.BRONZE, TierLevel.SILVER, TierLevel.GOLD, TierLevel.PLATINUM, TierLevel.DIAMOND]
    const currentIndex = tierOrder.indexOf(currentTier)

    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
      return {
        nextTier: null,
        requiredPoints: 0,
        pointsNeeded: 0,
      }
    }

    const nextTier = tierOrder[currentIndex + 1]
    const nextTierConfig = this.tierCache.get(nextTier)

    if (!nextTierConfig) {
      return {
        nextTier: null,
        requiredPoints: 0,
        pointsNeeded: 0,
      }
    }

    return {
      nextTier,
      requiredPoints: nextTierConfig.requiredPoints,
      pointsNeeded: Math.max(0, nextTierConfig.requiredPoints - currentPoints),
    }
  }

  async updateUserTier(userId: string): Promise<{ tierChanged: boolean; newTier: TierLevel; welcomeBonus: number }> {
    const userReward = await this.userRewardRepository.findOne({ where: { userId } })

    if (!userReward) {
      throw new Error(`User reward record not found for user: ${userId}`)
    }

    const newTier = await this.calculateTierLevel(userReward.lifetimePoints, userReward.completedShipments)
    const tierChanged = userReward.currentTier !== newTier
    let welcomeBonus = 0

    if (tierChanged) {
      const oldTier = userReward.currentTier
      userReward.currentTier = newTier
      userReward.tierAchievedDate = new Date()

      // Update multiplier based on new tier
      const tierConfig = await this.getTierConfiguration(newTier)
      if (tierConfig) {
        userReward.multiplier = tierConfig.pointsMultiplier
        welcomeBonus = tierConfig.welcomeBonus

        // Add welcome bonus points
        if (welcomeBonus > 0) {
          userReward.availablePoints += welcomeBonus
          userReward.totalPoints += welcomeBonus
          userReward.lifetimePoints += welcomeBonus
        }
      }

      await this.userRewardRepository.save(userReward)

      this.logger.log(`User ${userId} tier upgraded from ${oldTier} to ${newTier}`)
    }

    return { tierChanged, newTier, welcomeBonus }
  }

  async getTierProgress(userId: string): Promise<number> {
    const userReward = await this.userRewardRepository.findOne({ where: { userId } })

    if (!userReward) {
      return 0
    }

    const nextTierInfo = await this.getNextTierInfo(userReward.currentTier, userReward.lifetimePoints)

    if (!nextTierInfo.nextTier) {
      return 100 // Max tier reached
    }

    const currentTierConfig = await this.getTierConfiguration(userReward.currentTier)
    const currentTierPoints = currentTierConfig?.requiredPoints || 0
    const pointsInCurrentTier = userReward.lifetimePoints - currentTierPoints
    const pointsNeededForNextTier = nextTierInfo.requiredPoints - currentTierPoints

    return Math.min(100, Math.max(0, (pointsInCurrentTier / pointsNeededForNextTier) * 100))
  }

  private async seedDefaultTierConfigurations(): Promise<void> {
    const defaultConfigs = [
      {
        tier: TierLevel.BRONZE,
        requiredPoints: 0,
        requiredShipments: 0,
        pointsMultiplier: 1.0,
        welcomeBonus: 0,
        benefits: {
          pointsMultiplier: 1.0,
          welcomeBonus: 0,
        },
      },
      {
        tier: TierLevel.SILVER,
        requiredPoints: 1000,
        requiredShipments: 5,
        pointsMultiplier: 1.2,
        welcomeBonus: 100,
        benefits: {
          pointsMultiplier: 1.2,
          welcomeBonus: 100,
          freeShippingThreshold: 50,
        },
      },
      {
        tier: TierLevel.GOLD,
        requiredPoints: 2500,
        requiredShipments: 15,
        pointsMultiplier: 1.5,
        welcomeBonus: 250,
        benefits: {
          pointsMultiplier: 1.5,
          welcomeBonus: 250,
          freeShippingThreshold: 25,
          prioritySupport: true,
        },
      },
      {
        tier: TierLevel.PLATINUM,
        requiredPoints: 5000,
        requiredShipments: 30,
        pointsMultiplier: 1.8,
        welcomeBonus: 500,
        benefits: {
          pointsMultiplier: 1.8,
          welcomeBonus: 500,
          freeShippingThreshold: 0,
          prioritySupport: true,
          exclusiveOffers: true,
          birthdayBonus: 200,
        },
      },
      {
        tier: TierLevel.DIAMOND,
        requiredPoints: 10000,
        requiredShipments: 50,
        pointsMultiplier: 2.0,
        welcomeBonus: 1000,
        benefits: {
          pointsMultiplier: 2.0,
          welcomeBonus: 1000,
          freeShippingThreshold: 0,
          prioritySupport: true,
          exclusiveOffers: true,
          birthdayBonus: 500,
        },
      },
    ]

    for (const config of defaultConfigs) {
      const tierConfig = this.tierConfigRepository.create(config)
      await this.tierConfigRepository.save(tierConfig)
    }

    this.logger.log("Default tier configurations seeded")
  }

  private async loadTierCache(): Promise<void> {
    const configs = await this.tierConfigRepository.find({ where: { isActive: true } })

    this.tierCache.clear()
    for (const config of configs) {
      this.tierCache.set(config.tier, config)
    }

    this.isCacheInitialized = true
    this.logger.log(`Loaded ${configs.length} tier configurations into cache`)
  }

  private async ensureCacheInitialized(): Promise<void> {
    if (!this.isCacheInitialized) {
      await this.initializeTierConfigurations()
    }
  }
}
