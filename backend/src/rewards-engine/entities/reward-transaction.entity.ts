import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum TransactionType {
  EARNED = "EARNED",
  REDEEMED = "REDEEMED",
  EXPIRED = "EXPIRED",
  BONUS = "BONUS",
  ADJUSTMENT = "ADJUSTMENT",
}

export enum RewardSource {
  SHIPMENT_COMPLETED = "SHIPMENT_COMPLETED",
  POSITIVE_REVIEW = "POSITIVE_REVIEW",
  REFERRAL = "REFERRAL",
  TIER_BONUS = "TIER_BONUS",
  SPECIAL_PROMOTION = "SPECIAL_PROMOTION",
  REDEMPTION = "REDEMPTION",
  EXPIRATION = "EXPIRATION",
  MANUAL_ADJUSTMENT = "MANUAL_ADJUSTMENT",
}

@Entity("reward_transactions")
@Index(["userId", "createdAt"])
@Index(["transactionType"])
@Index(["source"])
export class RewardTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  @Index()
  userId: string

  @Column({ type: "enum", enum: TransactionType })
  transactionType: TransactionType

  @Column({ type: "enum", enum: RewardSource })
  source: RewardSource

  @Column({ type: "integer" })
  points: number

  @Column({ type: "integer", default: 0 })
  balanceBefore: number

  @Column({ type: "integer", default: 0 })
  balanceAfter: number

  @Column({ type: "varchar", length: 255, nullable: true })
  referenceId: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "date", nullable: true })
  expirationDate: Date

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
