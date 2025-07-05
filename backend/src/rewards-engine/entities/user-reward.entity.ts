import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum TierLevel {
  BRONZE = "BRONZE",
  SILVER = "SILVER",
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
  DIAMOND = "DIAMOND",
}

@Entity("user_rewards")
@Index(["userId"])
export class UserReward {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  @Index()
  userId: string

  @Column({ type: "integer", default: 0 })
  totalPoints: number

  @Column({ type: "integer", default: 0 })
  availablePoints: number

  @Column({ type: "integer", default: 0 })
  redeemedPoints: number

  @Column({ type: "integer", default: 0 })
  lifetimePoints: number

  @Column({ type: "enum", enum: TierLevel, default: TierLevel.BRONZE })
  currentTier: TierLevel

  @Column({ type: "integer", default: 0 })
  tierProgress: number

  @Column({ type: "integer", default: 0 })
  completedShipments: number

  @Column({ type: "integer", default: 0 })
  positiveReviews: number

  @Column({ type: "decimal", precision: 3, scale: 2, default: 1.0 })
  multiplier: number

  @Column({ type: "date", nullable: true })
  lastActivityDate: Date

  @Column({ type: "date", nullable: true })
  tierAchievedDate: Date

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
