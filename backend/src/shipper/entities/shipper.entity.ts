import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Shipment } from "./shipment.entity"

export enum ShipperStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
}

export enum VehicleType {
  CAR = "car",
  VAN = "van",
  TRUCK = "truck",
  MOTORCYCLE = "motorcycle",
  BICYCLE = "bicycle",
}

@Entity("shippers")
export class Shipper {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  phoneNumber: string

  @Column({ nullable: true })
  profileImage: string

  @Column({
    type: "enum",
    enum: ShipperStatus,
    default: ShipperStatus.PENDING,
  })
  status: ShipperStatus

  @Column({ nullable: true })
  licenseNumber: string

  @Column({ nullable: true })
  licenseExpiryDate: Date

  @Column({ nullable: true })
  insuranceNumber: string

  @Column({ nullable: true })
  insuranceExpiryDate: Date

  @Column({
    type: "enum",
    enum: VehicleType,
    nullable: true,
  })
  vehicleType: VehicleType

  @Column({ nullable: true })
  vehicleModel: string

  @Column({ nullable: true })
  vehiclePlateNumber: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ nullable: true })
  city: string

  @Column({ nullable: true })
  state: string

  @Column({ nullable: true })
  zipCode: string

  @Column({ nullable: true })
  country: string

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  latitude: number

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  longitude: number

  @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ default: 0 })
  totalDeliveries: number

  @Column({ default: true })
  isAvailable: boolean

  @Column({ nullable: true })
  verificationToken: string

  @Column({ default: false })
  isEmailVerified: boolean

  @Column({ nullable: true })
  resetPasswordToken: string

  @Column({ nullable: true })
  resetPasswordExpires: Date

  @OneToMany(
    () => Shipment,
    (shipment) => shipment.shipper,
  )
  shipments: Shipment[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
