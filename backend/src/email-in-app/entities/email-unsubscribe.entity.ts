import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"
import { EmailCategory } from "../interfaces/email.interface"

@Entity("email_unsubscribes")
@Index(["email", "category"], { unique: true })
@Index(["email"])
export class EmailUnsubscribeEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255 })
  @Index()
  email: string

  @Column({ type: "enum", enum: EmailCategory, nullable: true })
  category: EmailCategory

  @Column({ type: "varchar", length: 255, nullable: true })
  reason: string

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress: string

  @Column({ type: "text", nullable: true })
  userAgent: string

  @Column({ type: "uuid", nullable: true })
  userId: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  unsubscribedAt: Date
}
