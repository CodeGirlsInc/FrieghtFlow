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
import { InsurancePolicy } from './insurance-policy.entity';

export enum ClaimStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SETTLED = 'settled',
  CLOSED = 'closed',
}

export enum ClaimType {
  DAMAGE = 'damage',
  LOSS = 'loss',
  THEFT = 'theft',
  DELAY = 'delay',
  GENERAL_AVERAGE = 'general_average',
  PARTICULAR_AVERAGE = 'particular_average',
  OTHER = 'other',
}

@Entity({ name: 'claim_history' })
export class ClaimHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  claimNumber: string;

  @Column({ type: 'enum', enum: ClaimType })
  claimType: ClaimType;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.SUBMITTED })
  status: ClaimStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  claimedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  approvedAmount?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  paidAmount?: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'timestamptz' })
  incidentDate: Date;

  @Column({ type: 'timestamptz' })
  claimDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  settlementDate?: Date;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  investigationNotes?: string;

  @Column({ type: 'text', nullable: true })
  supportingDocuments?: string; // JSON string of document URLs/paths

  @Column({ type: 'text', nullable: true })
  adjusterNotes?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adjusterName?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  adjusterContact?: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string;

  @Column({ type: 'text', nullable: true })
  settlementNotes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationship with Insurance Policy
  @Column({ type: 'uuid' })
  insurancePolicyId: string;

  @ManyToOne(() => InsurancePolicy, (policy) => policy.claimHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'insurancePolicyId' })
  insurancePolicy: InsurancePolicy;
}
