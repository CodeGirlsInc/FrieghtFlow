import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"
import { EmailCategory, EmailPriority, DeliveryStatus } from "../interfaces/email.interface"

@Entity("email_messages")
@Index(["status", "createdAt"])
@Index(["userId", "category"])
@Index(["organizationId", "createdAt"])
@Index(["scheduledAt"])
export class EmailMessageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "simple-array" })
  to: string[]

  @Column({ type: "simple-array", nullable: true })
  cc: string[]

  @Column({ type: "simple-array", nullable: true })
  bcc: string[]

  @Column({ type: "varchar", length: 255 })
  from: string

  @Column({ type: "varchar", length: 255, nullable: true })
  replyTo: string

  @Column({ type: "varchar", length: 500 })
  subject: string

  @Column({ type: "text", nullable: true })
  htmlContent: string

  @Column({ type: "text", nullable: true })
  textContent: string

  @Column({ type: "uuid", nullable: true })
  @Index()
  templateId: string

  @Column({ type: "jsonb", nullable: true })
  templateData: Record<string, any>

  @Column({ type: "jsonb", nullable: true })
  attachments: any[]

  @Column({ type: "enum", enum: EmailPriority, default: EmailPriority.NORMAL })
  @Index()
  priority: EmailPriority

  @Column({ type: "enum", enum: EmailCategory })
  @Index()
  category: EmailCategory

  @Column({ type: "simple-array", nullable: true })
  tags: string[]

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "enum", enum: DeliveryStatus, default: DeliveryStatus.PENDING })
  @Index()
  status: DeliveryStatus

  @Column({ type: "varchar", length: 255, nullable: true })
  providerMessageId: string

  @Column({ type: "timestamp", nullable: true })
  @Index()
  scheduledAt: Date

  @Column({ type: "timestamp", nullable: true })
  expiresAt: Date

  @Column({ type: "timestamp", nullable: true })
  sentAt: Date

  @Column({ type: "timestamp", nullable: true })
  deliveredAt: Date

  @Column({ type: "timestamp", nullable: true })
  openedAt: Date

  @Column({ type: "timestamp", nullable: true })
  clickedAt: Date

  @Column({ type: "timestamp", nullable: true })
  bouncedAt: Date

  @Column({ type: "text", nullable: true })
  bounceReason: string

  @Column({ type: "timestamp", nullable: true })
  unsubscribedAt: Date

  @Column({ type: "timestamp", nullable: true })
  spamReportedAt: Date

  @Column({ type: "text", nullable: true })
  errorMessage: string

  @Column({ type: "integer", default: 0 })
  attempts: number

  @Column({ type: "timestamp", nullable: true })
  lastAttemptAt: Date

  @Column({ type: "timestamp", nullable: true })
  nextRetryAt: Date

  @Column({ type: "boolean", default: true })
  trackingEnabled: boolean

  @Column({ type: "uuid", nullable: true })
  @Index()
  userId: string

  @Column({ type: "uuid", nullable: true })
  @Index()
  organizationId: string

  @Column({ type: "uuid", nullable: true })
  shipmentId: string

  @Column({ type: "uuid", nullable: true })
  orderId: string

  @Column({ type: "varchar", length: 255, nullable: true })
  contractAddress: string

  @Column({ type: "varchar", length: 255, nullable: true })
  transactionHash: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
