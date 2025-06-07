import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from "typeorm"
import { CarrierDocument } from "./carrier-document.entity"
import { Vehicle } from "./vehicle.entity"
import { OperationalHistory } from "./operational-history.entity"
import { CarrierVerification } from "./carrier-verification.entity"

export enum CarrierStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  SUSPENDED = "suspended",
  REJECTED = "rejected",
  INACTIVE = "inactive",
}

export enum CarrierType {
  INDIVIDUAL = "individual",
  COMPANY = "company",
  FLEET = "fleet",
}

@Entity("carriers")
@Index(["status", "isActive"])
@Index(["email"], { unique: true })
@Index(["licenseNumber"], { unique: true })
export class Carrier {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  companyName: string

  @Column()
  contactPerson: string

  @Column({ unique: true })
  email: string

  @Column()
  phone: string

  @Column({ nullable: true })
  alternatePhone?: string

  @Column("text")
  address: string

  @Column()
  city: string

  @Column()
  state: string

  @Column()
  zipCode: string

  @Column()
  country: string

  @Column({ unique: true })
  licenseNumber: string

  @Column({ nullable: true })
  taxId?: string

  @Column({
    type: "enum",
    enum: CarrierType,
    default: CarrierType.INDIVIDUAL,
  })
  carrierType: CarrierType

  @Column({
    type: "enum",
    enum: CarrierStatus,
    default: CarrierStatus.PENDING,
  })
  status: CarrierStatus

  @Column({ default: true })
  isActive: boolean

  @Column("decimal", { precision: 3, scale: 2, default: 0 })
  rating: number

  @Column({ default: 0 })
  totalShipments: number

  @Column({ default: 0 })
  completedShipments: number

  @Column("text", { nullable: true })
  description?: string

  @Column("simple-array", { nullable: true })
  serviceAreas?: string[]

  @Column("simple-array", { nullable: true })
  specializations?: string[]

  @Column({ nullable: true })
  website?: string

  @Column("jsonb", { nullable: true })
  operatingHours?: {
    monday?: { start: string; end: string; closed?: boolean }
    tuesday?: { start: string; end: string; closed?: boolean }
    wednesday?: { start: string; end: string; closed?: boolean }
    thursday?: { start: string; end: string; closed?: boolean }
    friday?: { start: string; end: string; closed?: boolean }
    saturday?: { start: string; end: string; closed?: boolean }
    sunday?: { start: string; end: string; closed?: boolean }
  }

  @Column("jsonb", { nullable: true })
  bankDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
    routingNumber: string
    swiftCode?: string
  }

  @Column({ nullable: true })
  profileImageUrl?: string

  @OneToMany(
    () => CarrierDocument,
    (document) => document.carrier,
    { cascade: true },
  )
  documents: CarrierDocument[]

  @OneToMany(
    () => Vehicle,
    (vehicle) => vehicle.carrier,
    { cascade: true },
  )
  vehicles: Vehicle[]

  @OneToMany(
    () => OperationalHistory,
    (history) => history.carrier,
  )
  operationalHistory: OperationalHistory[]

  @OneToOne(
    () => CarrierVerification,
    (verification) => verification.carrier,
    { cascade: true },
  )
  verification: CarrierVerification

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
