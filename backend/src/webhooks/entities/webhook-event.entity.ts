import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum WebhookStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  PROCESSED = "processed",
  FAILED = "failed",
  RETRYING = "retrying",
}

@Entity("webhook_events")
@Index(["source", "createdAt"])
@Index(["status"])
@Index(["eventType"])
export class WebhookEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 100 })
  @Index()
  source: string

  @Column({ name: "event_type", length: 100 })
  eventType: string

  @Column({ name: "event_id", length: 255, nullable: true })
  @Index()
  eventId?: string

  @Column({ type: "jsonb" })
  payload: Record<string, any>

  @Column({ type: "jsonb", nullable: true })
  headers?: Record<string, string>

  @Column({
    type: "enum",
    enum: WebhookStatus,
    default: WebhookStatus.PENDING,
  })
  status: WebhookStatus

  @Column({ name: "processing_attempts", default: 0 })
  processingAttempts: number

  @Column({ name: "last_error", type: "text", nullable: true })
  lastError?: string

  @Column({ name: "processed_at", nullable: true })
  processedAt?: Date

  @Column({ name: "signature_valid", default: false })
  signatureValid: boolean

  @Column({ name: "ip_address", length: 45, nullable: true })
  ipAddress?: string

  @Column({ name: "user_agent", length: 1000, nullable: true })
  userAgent?: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date
}
