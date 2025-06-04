import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm"
import { User } from "../../users/entities/user.entity"

export enum DocumentType {
  ID_VERIFICATION = "id_verification",
  BUSINESS_REGISTRATION = "business_registration",
  TAX_CERTIFICATE = "tax_certificate",
  INSURANCE_CERTIFICATE = "insurance_certificate",
  LICENSE = "license",
  OTHER = "other",
}

export enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

@Entity("compliance_documents")
export class ComplianceDocument {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({
    type: "enum",
    enum: DocumentType,
    default: DocumentType.OTHER,
  })
  documentType: DocumentType

  @Column()
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column()
  fileUrl: string

  @Column({ nullable: true })
  fileType: string

  @Column({ type: "bigint", nullable: true })
  fileSize: number

  @Column({
    type: "enum",
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus

  @Column({ type: "date", nullable: true })
  expiryDate: Date

  @Column({ type: "text", nullable: true })
  rejectionReason: string

  @Column({ type: "text", nullable: true })
  notes: string

  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User

  @Column({ type: "uuid" })
  userId: string

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "reviewedById" })
  reviewedBy: User

  @Column({ type: "uuid", nullable: true })
  reviewedById: string

  @Column({ nullable: true })
  reviewedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
