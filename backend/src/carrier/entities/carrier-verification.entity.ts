import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm"
import { Carrier } from "./carrier.entity"

export enum VerificationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity("carrier_verifications")
export class CarrierVerification {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  carrierId: string

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus

  @Column("jsonb", { nullable: true })
  checklist?: {
    businessLicense: boolean
    insurance: boolean
    vehicleRegistration: boolean
    driverLicense: boolean
    backgroundCheck: boolean
    bankVerification: boolean
  }

  @Column("text", { nullable: true })
  notes?: string

  @Column({ nullable: true })
  verifiedBy?: string

  @Column({ nullable: true })
  verifiedAt?: Date

  @Column("simple-array", { nullable: true })
  rejectionReasons?: string[]

  @Column({ default: 0 })
  verificationScore: number

  @OneToOne(
    () => Carrier,
    (carrier) => carrier.verification,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "carrierId" })
  carrier: Carrier

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
