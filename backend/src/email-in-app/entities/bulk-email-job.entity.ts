import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

@Entity("bulk_email_jobs")
@Index(["status", "createdAt"])
export class BulkEmailJobEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "uuid" })
  templateId: string

  @Column({ type: "jsonb" })
  recipients: Array<{
    email: string
    data: Record<string, any>
  }>

  @Column({ type: "enum", enum: ["pending", "processing", "completed", "failed"], default: "pending" })
  @Index()
  status: "pending" | "processing" | "completed" | "failed"

  @Column({ type: "integer" })
  totalRecipients: number

  @Column({ type: "integer", default: 0 })
  processedRecipients: number

  @Column({ type: "integer", default: 0 })
  failedRecipients: number

  @Column({ type: "text", nullable: true })
  errorMessage: string

  @Column({ type: "uuid", nullable: true })
  createdBy: string

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
