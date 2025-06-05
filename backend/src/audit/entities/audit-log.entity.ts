import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"
import { AuditEventType, AuditSeverity, AuditStatus } from "../types/audit.types"

@Entity("audit_logs")
@Index(["eventType", "createdAt"])
@Index(["userId", "createdAt"])
@Index(["severity", "createdAt"])
@Index(["module", "createdAt"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: AuditEventType,
  })
  @Index()
  eventType: AuditEventType

  @Column({
    type: "enum",
    enum: AuditSeverity,
    default: AuditSeverity.LOW,
  })
  @Index()
  severity: AuditSeverity

  @Column({
    type: "enum",
    enum: AuditStatus,
    default: AuditStatus.INFO,
  })
  @Index()
  status: AuditStatus

  @Column("text")
  message: string

  @Column({ nullable: true })
  @Index()
  userId: string

  @Column({ nullable: true })
  userEmail: string

  @Column({ nullable: true })
  userRole: string

  @Column({ nullable: true })
  sessionId: string

  @Column({ nullable: true })
  @Index()
  ipAddress: string

  @Column("text", { nullable: true })
  userAgent: string

  @Column({ nullable: true })
  requestId: string

  @Column({ nullable: true })
  correlationId: string

  @Column({ nullable: true })
  @Index()
  module: string

  @Column({ nullable: true })
  action: string

  @Column({ nullable: true })
  resource: string

  @Column({ nullable: true })
  resourceId: string

  @Column("jsonb", { nullable: true })
  additionalData: Record<string, any>

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>

  @Column("jsonb", { nullable: true })
  changes: {
    before?: Record<string, any>
    after?: Record<string, any>
  }

  @CreateDateColumn()
  @Index()
  createdAt: Date

  @Column({ nullable: true })
  expiresAt: Date
}
