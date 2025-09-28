// entities/customs-document.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { CustomsRequirement } from './customs-requirement.entity';

export enum DocumentStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum DocumentType {
  COMMERCIAL_INVOICE = 'commercial_invoice',
  PACKING_LIST = 'packing_list',
  BILL_OF_LADING = 'bill_of_lading',
  AIR_WAYBILL = 'air_waybill',
  CERTIFICATE_OF_ORIGIN = 'certificate_of_origin',
  EXPORT_LICENSE = 'export_license',
  IMPORT_LICENSE = 'import_license',
  PHYTOSANITARY_CERTIFICATE = 'phytosanitary_certificate',
  HEALTH_CERTIFICATE = 'health_certificate',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  CUSTOMS_DECLARATION = 'customs_declaration',
  OTHER = 'other',
}

@Entity({ name: 'customs_documents' })
export class CustomsDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  shipmentId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  requirementId?: string;

  @Column({ type: 'enum', enum: DocumentType })
  documentType: DocumentType;

  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 500 })
  fileUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fileSize?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mimeType?: string;

  @Column({ type: 'enum', enum: DocumentStatus, default: DocumentStatus.PENDING })
  status: DocumentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'text', nullable: true })
  validationNotes?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  uploadedBy?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reviewedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'text', nullable: true })
  metadata?: string; // JSON string for additional document metadata

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationship with CustomsRequirement
  @ManyToOne(() => CustomsRequirement, (requirement) => requirement.id, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'requirementId' })
  requirement?: CustomsRequirement;
}
