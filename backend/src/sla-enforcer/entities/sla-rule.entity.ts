import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum SLAType {
  DELIVERY_TIME = "delivery_time",
  PICKUP_TIME = "pickup_time",
  PROCESSING_TIME = "processing_time",
  RESPONSE_TIME = "response_time",
}

export enum SLAPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

@Entity("sla_rules")
@Index(["ruleType", "isActive"])
export class SLARule {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({
    type: "enum",
    enum: SLAType,
    default: SLAType.DELIVERY_TIME,
  })
  ruleType: SLAType

  @Column({
    type: "enum",
    enum: SLAPriority,
    default: SLAPriority.MEDIUM,
  })
  priority: SLAPriority

  @Column({ type: "int" })
  thresholdMinutes: number

  @Column({ type: "int", default: 0 })
  gracePeriodMinutes: number

  @Column({ type: "jsonb", nullable: true })
  conditions: Record<string, any>

  @Column({ type: "jsonb" })
  actions: {
    alertEmails?: string[]
    webhookUrl?: string
    smartContractAddress?: string
    penaltyAmount?: number
    escalationLevel?: number
  }

  @Column({ default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
