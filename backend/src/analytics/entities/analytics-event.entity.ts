import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum EventType {
  USER_LOGIN = "user_login",
  USER_SIGNUP = "user_signup",
  SHIPMENT_CREATED = "shipment_created",
  SHIPMENT_DELIVERED = "shipment_delivered",
  SHIPMENT_CANCELLED = "shipment_cancelled",
  CARRIER_ASSIGNED = "carrier_assigned",
  PAYMENT_COMPLETED = "payment_completed",
  PAGE_VIEW = "page_view",
  BUTTON_CLICK = "button_click",
}

@Entity("analytics_events")
@Index(["eventType", "createdAt"])
@Index(["userId", "createdAt"])
@Index(["createdAt"])
export class AnalyticsEvent {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: EventType,
  })
  eventType: EventType

  @Column({ nullable: true })
  userId?: string

  @Column({ nullable: true })
  sessionId?: string

  @Column("jsonb", { nullable: true })
  properties?: Record<string, any>

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, any>

  @CreateDateColumn()
  createdAt: Date
}
