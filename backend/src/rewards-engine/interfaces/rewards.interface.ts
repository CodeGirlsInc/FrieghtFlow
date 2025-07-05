import type { TierLevel } from "../entities/user-reward.entity"
import type { RewardSource, TransactionType } from "../entities/reward-transaction.entity"

export interface RewardCalculationResult {
  basePoints: number
  bonusPoints: number
  totalPoints: number
  multiplier: number
  tierBonus: number
}

export interface TierBenefits {
  pointsMultiplier: number
  welcomeBonus: number
  freeShippingThreshold?: number
  prioritySupport?: boolean
  exclusiveOffers?: boolean
  birthdayBonus?: number
}

export interface RewardRule {
  source: RewardSource
  basePoints: number
  maxPointsPerDay?: number
  cooldownHours?: number
  conditions?: Record<string, any>
}

export interface TierRequirement {
  tier: TierLevel
  requiredPoints: number
  requiredShipments: number
  benefits: TierBenefits
}

export interface RewardEvent {
  userId: string
  source: RewardSource
  referenceId?: string
  customPoints?: number
  metadata?: Record<string, any>
}

export interface PointsTransaction {
  userId: string
  transactionType: TransactionType
  source: RewardSource
  points: number
  referenceId?: string
  description?: string
  metadata?: Record<string, any>
}
