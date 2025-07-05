import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum ShipmentStatus {
  CREATED = "created",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum ShipmentPriority {
  STANDARD = "standard",
  EXPRESS = "express",
  OVERNIGHT = "overnight",
  SAME_DAY = "same_day",
}

@Entity("shipments")
@Index(["status", "createdAt"])
@Index(["expectedDeliveryAt"])
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ length: 50, unique: true })
  trackingNumber: string

  @Column("uuid")
  @Index()
  customerId: string

  @Column({ length: 100 })
  origin: string

  @Column({ length: 100 })
  destination: string

  @Column({
    type: "enum",
    enum: ShipmentStatus,
    default: ShipmentStatus.CREATED,
  })
  status: ShipmentStatus

  @Column({
    type: "enum",
    enum: ShipmentPriority,
    default: ShipmentPriority.STANDARD,
  })
  priority: ShipmentPriority

  @Column({ type: "timestamp" })
  expectedDeliveryAt: Date

  @Column({ type: "timestamp", nullable: true })
  actualDeliveryAt: Date

  @Column({ type: "timestamp", nullable: true })
  pickedUpAt: Date

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
