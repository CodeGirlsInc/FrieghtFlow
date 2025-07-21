import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm"

export enum DocumentType {
  BILL_OF_LADING = "BILL_OF_LADING",
  COMMERCIAL_INVOICE = "COMMERCIAL_INVOICE",
  PACKING_LIST = "PACKING_LIST",
  CERTIFICATE_OF_ORIGIN = "CERTIFICATE_OF_ORIGIN",
  SHIPPING_MANIFEST = "SHIPPING_MANIFEST",
  CUSTOMS_DECLARATION = "CUSTOMS_DECLARATION",
  INSURANCE_CERTIFICATE = "INSURANCE_CERTIFICATE",
  OTHER = "OTHER",
}

export enum DocumentStatus {
  UPLOADED = "UPLOADED",
  PROCESSING = "PROCESSING",
  VALIDATED = "VALIDATED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
}

@Entity("shipping_documents")
@Index(["documentType", "status"])
@Index(["uploadedBy", "createdAt"])
@Index(["shipmentId"])
export class ShippingDocument {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  originalName: string

  @Column()
  fileName: string

  @Column()
  filePath: string

  @Column()
  mimeType: string

  @Column("bigint")
  fileSize: number

  @Column({
    type: "enum",
    enum: DocumentType,
  })
  documentType: DocumentType

  @Column({
    type: "enum",
    enum: DocumentStatus,
    default: DocumentStatus.UPLOADED,
  })
  status: DocumentStatus

  @Column({ nullable: true })
  shipmentId: string

  @Column({ nullable: true })
  uploadedBy: string

  @Column({ nullable: true })
  description: string

  @Column("jsonb", { nullable: true })
  metadata: Record<string, any>

  @Column({ nullable: true })
  s3Key: string

  @Column({ nullable: true })
  s3Bucket: string

  @Column({ nullable: true })
  checksum: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
