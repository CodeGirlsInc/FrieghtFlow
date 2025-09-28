import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

export enum ShipmentStatus {
  CREATED = "created",
  CONFIRMED = "confirmed",
  IN_TRANSIT = "in_transit",
  OUT_FOR_DELIVERY = "out_for_delivery",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  ARCHIVED = "archived",
}

export enum ShipmentPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("shipments")
export class Shipment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  trackingNumber: string

  @Column()
  originAddress: string

  @Column()
  originCity: string

  @Column()
  originState: string

  @Column()
  originCountry: string

  @Column()
  originPostalCode: string

  @Column()
  destinationAddress: string

  @Column()
  destinationCity: string

  @Column()
  destinationState: string

  @Column()
  destinationCountry: string

  @Column()
  destinationPostalCode: string

  @Column("text")
  cargoDescription: string

  @Column("decimal", { precision: 10, scale: 2 })
  cargoWeight: number

  @Column("decimal", { precision: 10, scale: 2 })
  cargoVolume: number

  @Column()
  cargoQuantity: number

  @Column()
  cargoUnit: string

  @Column("decimal", { precision: 10, scale: 2 })
  cargoValue: number

  @Column()
  cargoCurrency: string

  @Column()
  assignedCarrier: string

  @Column({ nullable: true })
  carrierContactInfo: string

  @Column({ nullable: true })
  vehicleInfo: string

  @Column({ nullable: true })
  driverInfo: string

  @Column({
    type: "enum",
    enum: ShipmentStatus,
    default: ShipmentStatus.CREATED,
  })
  status: ShipmentStatus

  @Column({
    type: "enum",
    enum: ShipmentPriority,
    default: ShipmentPriority.NORMAL,
  })
  priority: ShipmentPriority

  @Column({ type: "timestamp", nullable: true })
  scheduledPickupDate: Date

  @Column({ type: "timestamp", nullable: true })
  actualPickupDate: Date

  @Column({ type: "timestamp", nullable: true })
  estimatedDeliveryDate: Date

  @Column({ type: "timestamp", nullable: true })
  actualDeliveryDate: Date

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  shippingCost: number

  @Column({ nullable: true })
  costCurrency: string

  @Column("text", { nullable: true })
  specialInstructions: string

  @Column("text", { nullable: true })
  trackingNotes: string

  @Column({ default: false })
  isArchived: boolean

  @Column({ type: "timestamp", nullable: true })
  archivedAt: Date

  @Column({ nullable: true })
  archivedBy: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
