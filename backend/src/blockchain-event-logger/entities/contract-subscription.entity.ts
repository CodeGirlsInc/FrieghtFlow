import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"
import type { EventType } from "./blockchain-event.entity"

export enum SubscriptionStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  STOPPED = "stopped",
  ERROR = "error",
}

@Entity("contract_subscriptions")
@Index(["contractAddress", "isActive"])
export class ContractSubscription {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  name: string

  @Column({ length: 66 })
  @Index()
  contractAddress: string

  @Column({ type: "simple-array" })
  eventTypes: EventType[]

  @Column({
    type: "enum",
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus

  @Column({ type: "bigint", nullable: true })
  fromBlock: bigint

  @Column({ type: "bigint", nullable: true })
  lastProcessedBlock: bigint

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "int", default: 3 })
  maxRetries: number

  @Column({ type: "int", default: 5000 })
  retryDelayMs: number

  @Column({ type: "jsonb", nullable: true })
  filterCriteria: Record<string, any>

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "text", nullable: true })
  lastError: string

  @Column({ type: "timestamp", nullable: true })
  lastErrorAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
