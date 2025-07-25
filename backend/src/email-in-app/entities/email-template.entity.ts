import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"
import { EmailCategory, EmailPriority } from "../interfaces/email.interface"

@Entity("email_templates")
@Index(["category", "isActive"])
@Index(["name", "version"])
export class EmailTemplateEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 255, unique: true })
  @Index()
  name: string

  @Column({ type: "varchar", length: 500 })
  subject: string

  @Column({ type: "text" })
  htmlContent: string

  @Column({ type: "text" })
  textContent: string

  @Column({ type: "simple-array" })
  variables: string[]

  @Column({ type: "enum", enum: EmailCategory })
  @Index()
  category: EmailCategory

  @Column({ type: "enum", enum: EmailPriority, default: EmailPriority.NORMAL })
  priority: EmailPriority

  @Column({ type: "boolean", default: true })
  @Index()
  isActive: boolean

  @Column({ type: "varchar", length: 50, default: "1.0.0" })
  version: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @Column({ type: "varchar", length: 255, nullable: true })
  createdBy: string

  @Column({ type: "varchar", length: 255, nullable: true })
  updatedBy: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
