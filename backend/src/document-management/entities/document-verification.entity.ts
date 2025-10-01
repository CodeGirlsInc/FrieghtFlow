import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Document } from './document.entity';
import { User } from '../../users/entities/user.entity';

export enum VerificationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}

export enum VerificationType {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
  OCR = 'OCR',
  SIGNATURE = 'SIGNATURE',
  DIGITAL_SIGNATURE = 'DIGITAL_SIGNATURE',
}

@Entity('document_verifications')
@Index(['documentId', 'status'])
@Index(['verifiedBy', 'createdAt'])
@Index(['verificationType', 'status'])
export class DocumentVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  documentId: string;

  @Column({
    type: 'enum',
    enum: VerificationType,
  })
  verificationType: VerificationType;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ nullable: true })
  verificationNotes: string;

  @Column('jsonb', { nullable: true })
  verificationData: Record<string, any>;

  @Column({ nullable: true })
  confidenceScore: number;

  @Column({ nullable: true })
  errorMessage: string;

  @Column({ nullable: true })
  processingTime: number; // in milliseconds

  @Column({ nullable: true })
  ocrText: string;

  @Column({ nullable: true })
  extractedData: string; // JSON string of extracted structured data

  @Column({ nullable: true })
  signatureValid: boolean;

  @Column({ nullable: true })
  documentIntegrity: boolean;

  @Column({ nullable: true })
  complianceCheck: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;

  // Relations
  @ManyToOne(() => Document, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verifiedBy' })
  verifier: User;
}
