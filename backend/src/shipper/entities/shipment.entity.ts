import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { Shipper } from "./shipper.entity"
import { ShipmentStatus } from "./shipment-status.entity"

export enum ShipmentPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("shipments")
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  trackingNumber: string

  @Column("uuid")
  shipperId: string

  @ManyToOne(
    () => Shipper,
    (shipper) => shipper.shipments,
  )
  @JoinColumn({ name: "shipperId" })
  shipper: Shipper

  @Column()
  senderName: string

  @Column()
  senderEmail: string

  @Column()
  senderPhone: string

  @Column({ type: "text" })
  senderAddress: string

  @Column()
  recipientName: string

  @Column()
  recipientEmail: string

  @Column()
  recipientPhone: string

  @Column({ type: "text" })
  recipientAddress: string

  @Column({ type: "text", nullable: true })
  packageDescription: string

  @Column({ type: "decimal", precision: 8, scale: 2 })
  weight: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  length: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  width: number

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  height: number

  @Column({ type: "decimal", precision: 10, scale: 2 })
  shippingCost: number

  @Column({
    type: "enum",
    enum: ShipmentPriority,
    default: ShipmentPriority.MEDIUM,
  })
  priority: ShipmentPriority

  @Column({ nullable: true })
  estimatedDeliveryDate: Date

  @Column({ nullable: true })
  actualDeliveryDate: Date

  @Column({ type: "text", nullable: true })
  specialInstructions: string

  @Column({ default: false })
  requiresSignature: boolean

  @Column({ default: false })
  isFragile: boolean

  @Column({ nullable: true })
  paymentId: string

  @OneToMany(
    () => ShipmentStatus,
    (status) => status.shipment,
    {
      cascade: true,
    },
  )
  statusHistory: ShipmentStatus[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
