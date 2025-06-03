import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { Business } from "./business.entity"

@Entity("verification_statuses")
export class VerificationStatus {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(
    () => Business,
    (business) => business.verification,
  )
  @JoinColumn()
  business: Business

  @Column({ default: "pending" })
  status: "pending" | "verified" | "rejected"

  @Column({ type: "json", nullable: true })
  documents: {
    type: string
    url: string
    verifiedAt?: Date
    status: "pending" | "verified" | "rejected"
  }[]

  @Column({ nullable: true })
  verifiedBy: string

  @Column({ type: "timestamp", nullable: true })
  verifiedAt: Date

  @Column({ nullable: true })
  rejectionReason: string

  @Column({ default: false })
  isCompliant: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
