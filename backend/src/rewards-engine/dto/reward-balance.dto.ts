import { ApiProperty } from "@nestjs/swagger"
import { TierLevel } from "../entities/user-reward.entity"

export class RewardBalanceDto {
  @ApiProperty({ description: "User ID", example: "user-123" })
  userId: string

  @ApiProperty({ description: "Available points for redemption", example: 1250 })
  availablePoints: number

  @ApiProperty({ description: "Total points earned", example: 2500 })
  totalPoints: number

  @ApiProperty({ description: "Points redeemed", example: 750 })
  redeemedPoints: number

  @ApiProperty({ description: "Lifetime points earned", example: 5000 })
  lifetimePoints: number

  @ApiProperty({ description: "Current tier level", enum: TierLevel })
  currentTier: TierLevel

  @ApiProperty({ description: "Progress towards next tier", example: 75 })
  tierProgress: number

  @ApiProperty({ description: "Points multiplier", example: 1.5 })
  multiplier: number

  @ApiProperty({ description: "Completed shipments count", example: 25 })
  completedShipments: number

  @ApiProperty({ description: "Positive reviews count", example: 18 })
  positiveReviews: number

  @ApiProperty({ description: "Next tier information" })
  nextTier: {
    tier: TierLevel | null
    requiredPoints: number
    pointsNeeded: number
  }
}
