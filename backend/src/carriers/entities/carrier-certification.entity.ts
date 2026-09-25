import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Document } from '../../documents/entities/document.entity';

export enum CertificationType {
  OPERATING_LICENSE = 'Operating License',
  INSURANCE_CERTIFICATE = 'Insurance Certificate',
  SAFETY_CERTIFICATION = 'Safety Certification',
  HAZMAT_CERTIFICATION = 'Hazmat Certification',
  VEHICLE_REGISTRATION = 'Vehicle Registration',
  OTHER = 'Other',
}

@Entity('carrier_certifications')
@Index(['carrierId'])
@Index(['documentId'], { unique: true })
@Index(['isVerified', 'expiresAt', 'verificationRevokedAt'])
export class CarrierCertification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'carrier_id', type: 'uuid' })
  carrierId: string;

  @Column({
    name: 'document_type',
    type: 'enum',
    enum: CertificationType,
  })
  documentType: CertificationType;

  /**
   * Legacy URL retained for records created before platform document
   * provenance was introduced. New certifications never populate this field;
   * `documentId` is the authoritative reference.
   */
  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string | null;

  @ManyToOne(() => Document, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'document_id' })
  document: Document | null;

  @Column({ name: 'document_id', type: 'uuid', nullable: true })
  documentId: string | null;

  /**
   * Set only after the upload service has verified that the document belongs to
   * the carrier. This is an immutable provenance signal for admin review.
   */
  @Column({ name: 'is_platform_hosted', default: false })
  isPlatformHosted: boolean;

  @Column({ name: 'issued_by' })
  issuedBy: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  /** Set atomically by the expiry sweep to prevent stale re-verification. */
  @Column({
    name: 'verification_revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  verificationRevokedAt: Date | null;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
