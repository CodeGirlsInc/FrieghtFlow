import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum WebhookProvider {
  STRIPE = "stripe",
  EMAIL = "email",
  STELLAR = "stellar",
  GENERIC = "generic",
}

export enum WebhookStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  PROCESSED = "processed",
  FAILED = "failed",
  RETRY = "retry",
}

@Entity("webhook_events")
export class WebhookEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  @Index()
  externalId: string

  @Column({
    type: "enum",
    enum: WebhookProvider,
    default: WebhookProvider.GENERIC,
  })
  @Index()
  provider: WebhookProvider

  @Column({ type: "varchar", length: 255 })
  @Index()
  eventType: string

  @Column({ type: "jsonb" })
  payload: Record<string, any>

  @Column({
    type: "enum",
    enum: WebhookStatus,
    default: WebhookStatus.PENDING,
  })
  @Index()
  status: WebhookStatus

  @Column({ type: "int", default: 0 })
  retryCount: number

  @Column({ type: "varchar", length: 1000, nullable: true })
  errorMessage: string

  @Column({ type: "jsonb", nullable: true })
  headers: Record<string, any>

  @Column({ type: "boolean", default: false })
  verified: boolean

  @Column({ type: "timestamp", nullable: true })
  processedAt: Date

  @Column({ type: "timestamp", nullable: true })
  nextRetryAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
