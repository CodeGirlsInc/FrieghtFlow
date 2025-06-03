import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Shipment } from "./shipment.entity"

export enum DeliveryStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  PICKED_UP = "picked_up",
  IN_TRANSIT = "in_transit",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  FAILED_DELIVERY = "failed_delivery",
  RETURNED = "returned",
  CANCELLED = "cancelled",
}

@Entity("shipment_statuses")
export class ShipmentStatus {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  shipmentId: string

  @ManyToOne(
    () => Shipment,
    (shipment) => shipment.statusHistory,
  )
  @JoinColumn({ name: "shipmentId" })
  shipment: Shipment

  @Column({
    type: "enum",
    enum: DeliveryStatus,
  })
  status: DeliveryStatus

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude: number

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude: number

  @Column({ nullable: true })
  imageUrl: string

  @CreateDateColumn()
  createdAt: Date
}
