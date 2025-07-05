import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum RedemptionStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum RedemptionType {
  DISCOUNT_COUPON = "DISCOUNT_COUPON",
  FREE_SHIPPING = "FREE_SHIPPING",
  CASH_BACK = "CASH_BACK",
  GIFT_CARD = "GIFT_CARD",
  MERCHANDISE = "MERCHANDISE",
  UPGRADE = "UPGRADE",
}

@Entity("redemptions")
@Index(["userId", "status"])
@Index(["status", "createdAt"])
export class Redemption {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  @Index()
  userId: string

  @Column({ type: "enum", enum: RedemptionType })
  redemptionType: RedemptionType

  @Column({ type: "integer" })
  pointsRequired: number

  @Column({ type: "integer" })
  pointsUsed: number

  @Column({ type: "enum", enum: RedemptionStatus, default: RedemptionStatus.PENDING })
  status: RedemptionStatus

  @Column({ type: "varchar", length: 255 })
  itemName: string

  @Column({ type: "text", nullable: true })
  itemDescription: string

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  monetaryValue: number

  @Column({ type: "varchar", length: 100, nullable: true })
  couponCode: string

  @Column({ type: "date", nullable: true })
  expirationDate: Date

  @Column({ type: "date", nullable: true })
  fulfilledDate: Date

  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
