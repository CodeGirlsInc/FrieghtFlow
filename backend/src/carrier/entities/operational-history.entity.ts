import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm"
import { Carrier } from "./carrier.entity"

export enum OperationType {
  SHIPMENT_COMPLETED = "shipment_completed",
  SHIPMENT_CANCELLED = "shipment_cancelled",
  VEHICLE_ADDED = "vehicle_added",
  VEHICLE_REMOVED = "vehicle_removed",
  DOCUMENT_UPLOADED = "document_uploaded",
  DOCUMENT_VERIFIED = "document_verified",
  STATUS_CHANGED = "status_changed",
  RATING_RECEIVED = "rating_received",
  VIOLATION_REPORTED = "violation_reported",
  MAINTENANCE_COMPLETED = "maintenance_completed",
}

@Entity("operational_history")
@Index(["carrierId", "createdAt"])
@Index(["operationType", "createdAt"])
export class OperationalHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  carrierId: string

  @Column({
    type: "enum",
    enum: OperationType,
  })
  operationType: OperationType

  @Column("text")
  description: string

  @Column("jsonb", { nullable: true })
  metadata?: Record<string, any>

  @Column({ nullable: true })
  relatedEntityId?: string

  @Column({ nullable: true })
  performedBy?: string

  @ManyToOne(
    () => Carrier,
    (carrier) => carrier.operationalHistory,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "carrierId" })
  carrier: Carrier

  @CreateDateColumn()
  createdAt: Date
}
