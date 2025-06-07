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

export enum DocumentType {
  BUSINESS_LICENSE = "business_license",
  INSURANCE_CERTIFICATE = "insurance_certificate",
  VEHICLE_REGISTRATION = "vehicle_registration",
  DRIVER_LICENSE = "driver_license",
  DOT_CERTIFICATE = "dot_certificate",
  SAFETY_CERTIFICATE = "safety_certificate",
  TAX_DOCUMENT = "tax_document",
  BANK_STATEMENT = "bank_statement",
  OTHER = "other",
}

export enum DocumentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

@Entity("carrier_documents")
@Index(["carrierId", "documentType"])
@Index(["status", "expiryDate"])
export class CarrierDocument {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  carrierId: string

  @Column({
    type: "enum",
    enum: DocumentType,
  })
  documentType: DocumentType

  @Column()
  fileName: string

  @Column()
  originalName: string

  @Column()
  filePath: string

  @Column()
  fileSize: number

  @Column()
  mimeType: string

  @Column({
    type: "enum",
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus

  @Column({ nullable: true })
  documentNumber?: string

  @Column({ type: "date", nullable: true })
  issueDate?: Date

  @Column({ type: "date", nullable: true })
  expiryDate?: Date

  @Column({ nullable: true })
  issuingAuthority?: string

  @Column("text", { nullable: true })
  description?: string

  @Column("text", { nullable: true })
  rejectionReason?: string

  @Column({ nullable: true })
  verifiedBy?: string

  @Column({ nullable: true })
  verifiedAt?: Date

  @ManyToOne(
    () => Carrier,
    (carrier) => carrier.documents,
    { onDelete: "CASCADE" },
  )
  @JoinColumn({ name: "carrierId" })
  carrier: Carrier

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
