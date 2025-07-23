import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { NotificationType, NotificationChannel } from "./notification.entity"

@Entity("notification_templates")
export class NotificationTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", length: 100, unique: true })
  name: string

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType

  @Column({
    type: "enum",
    enum: NotificationChannel,
  })
  channel: NotificationChannel

  @Column({ type: "varchar", length: 255 })
  subject: string

  @Column({ type: "text" })
  template: string

  @Column({ type: "text", nullable: true })
  htmlTemplate: string

  @Column({ type: "jsonb", nullable: true })
  variables: string[]

  @Column({ type: "jsonb", nullable: true })
  defaultData: Record<string, any>

  @Column({ default: true })
  isActive: boolean

  @Column({ type: "varchar", length: 50, default: "en" })
  language: string

  @Column({ type: "text", nullable: true })
  description: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
