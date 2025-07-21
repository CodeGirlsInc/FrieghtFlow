import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum AuditAction {
  USER_CREATED = "USER_CREATED",
  USER_UPDATED = "USER_UPDATED",
  USER_DELETED = "USER_DELETED",
  PAYMENT_PROCESSED = "PAYMENT_PROCESSED",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  ROLE_ASSIGNED = "ROLE_ASSIGNED",
  ROLE_REMOVED = "ROLE_REMOVED",
  ROLE_UPDATED = "ROLE_UPDATED",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
}

@Entity("audit_logs")
@Index(["action", "createdAt"])
@Index(["userId", "createdAt"])
@Index(["entityType", "entityId"])
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: AuditAction,
  })
  action: AuditAction

  @Column({ nullable: true })
  userId: string

  @Column({ nullable: true })
  userEmail: string

  @Column({ nullable: true })
  entityType: string

  @Column({ nullable: true })
  entityId: string

  @Column("jsonb", { nullable: true })
  oldValues: Record<string, any>

  @Column("jsonb", { nullable: true })
  newValues: Record<string, any>

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>

  @Column({ nullable: true })
  ipAddress: string

  @Column({ nullable: true })
  userAgent: string

  @Column({ default: "system" })
  source: string

  @CreateDateColumn()
  createdAt: Date
}
