import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum DocumentType {
  BILL_OF_LADING = 'BILL_OF_LADING',
  COMMERCIAL_INVOICE = 'COMMERCIAL_INVOICE',
  PACKING_LIST = 'PACKING_LIST',
  CERTIFICATE_OF_ORIGIN = 'CERTIFICATE_OF_ORIGIN',
  SHIPPING_MANIFEST = 'SHIPPING_MANIFEST',
  CUSTOMS_DECLARATION = 'CUSTOMS_DECLARATION',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  PHYTOSANITARY_CERTIFICATE = 'PHYTOSANITARY_CERTIFICATE',
  HEALTH_CERTIFICATE = 'HEALTH_CERTIFICATE',
  EXPORT_LICENSE = 'EXPORT_LICENSE',
  IMPORT_LICENSE = 'IMPORT_LICENSE',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  VALIDATED = 'VALIDATED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
  EXPIRED = 'EXPIRED',
}

export enum DocumentPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('documents')
@Index(['documentType', 'status'])
@Index(['uploadedBy', 'createdAt'])
@Index(['shipmentId'])
@Index(['expiryDate'])
@Index(['priority', 'status'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originalName: string;

  @Column()
  fileName: string;

  @Column()
  filePath: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  fileSize: number;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.UPLOADED,
  })
  status: DocumentStatus;

  @Column({
    type: 'enum',
    enum: DocumentPriority,
    default: DocumentPriority.MEDIUM,
  })
  priority: DocumentPriority;

  @Column({ nullable: true })
  shipmentId: string;

  @Column({ nullable: true })
  uploadedBy: string;

  @Column({ nullable: true })
  description: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  s3Key: string;

  @Column({ nullable: true })
  s3Bucket: string;

  @Column({ nullable: true })
  checksum: string;

  @Column({ nullable: true })
  version: string;

  @Column({ nullable: true })
  parentDocumentId: string;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  validatedBy: string;

  @Column({ nullable: true })
  validatedAt: Date;

  @Column({ nullable: true })
  tags: string;

  @Column({ default: false })
  isConfidential: boolean;

  @Column({ default: false })
  isRequired: boolean;

  @Column({ nullable: true })
  countryOfOrigin: string;

  @Column({ nullable: true })
  countryOfDestination: string;

  @Column({ nullable: true })
  customsCode: string;

  @Column({ nullable: true })
  weight: number;

  @Column({ nullable: true })
  value: number;

  @Column({ nullable: true })
  currency: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploadedBy' })
  uploader: User;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'parentDocumentId' })
  parentDocument: Document;
}
