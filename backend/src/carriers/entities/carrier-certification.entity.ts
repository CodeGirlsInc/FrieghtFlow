import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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

  @Column({ name: 'file_url', type: 'text' })
  fileUrl: string;

  @Column({ name: 'issued_by' })
  issuedBy: string;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ nullable: true, type: 'text' })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
