import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm"
import { Carrier } from "./carrier.entity"

export enum VehicleType {
  TRUCK = "truck",
  VAN = "van",
  MOTORCYCLE = "motorcycle",
  BICYCLE = "bicycle",
  CAR = "car",
  TRAILER = "trailer",
}

export enum VehicleStatus {
  AVAILABLE = "available",
  IN_USE = "in_use",
  MAINTENANCE = "maintenance",
  OUT_OF_SERVICE = "out_of_service",
}

export enum FuelType {
  GASOLINE = "gasoline",
  DIESEL = "diesel",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
  CNG = "cng",
  LPG = "lpg",
}

@Entity("vehicles")
@Index(["carrierId", "status"])
@Index(["vehicleType", "status"])
@Index(["licensePlate"], { unique: true })
export class Vehicle {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  carrierId: string

  @Column({
    type: "enum",
    enum: VehicleType,
  })
  vehicleType: VehicleType

  @Column()
  make: string

  @Column()
  model: string

  @Column()
  year: number

  @Column({ unique: true })
  licensePlate: string

  @Column({ nullable: true })
  vin?: string

  @Column({
    type: "enum",
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus

  @Column({
    type: "enum",
    enum: FuelType,
  })
  fuelType: FuelType

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  loadCapacity?: number

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  volumeCapacity?: number

  @Column("jsonb", { nullable: true })
  dimensions?: {
    length: number
    width: number
    height: number
    unit: string
  }

  @Column("text", { nullable: true })
  description?: string

  @Column("simple-array", { nullable: true })
  features?: string[]

  @Column({ nullable: true })
  insurancePolicyNumber?: string

  @Column({ type: "date", nullable: true })
  insuranceExpiryDate?: Date

  @Column({ type: "date", nullable: true })
  registrationExpiryDate?: Date

  @Column({ type: "date", nullable: true })
  inspectionExpiryDate?: Date

  @Column("simple-array", { nullable: true })
  imageUrls?: string[]

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  currentMileage?: number

  @Column({ type: "date", nullable: true })
  lastMaintenanceDate?: Date

  @Column({ type: "date", nullable: true })
  nextMaintenanceDate?: Date

  @Column("jsonb", { nullable: true })
  currentLocation?: {
    latitude: number
    longitude: number
    address?: string
    lastUpdated: Date
  }

  @Column({ default: true })
  isActive: boolean

  @ManyToOne(
    () => Carrier,
    (carrier) => carrier.vehicles,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "carrierId" })
  carrier: Carrier

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
