import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Shipment } from '../../shipment/shipment.entity';
import { ClaimHistory } from './claim-history.entity';

export enum CoverageType {
  ALL_RISK = 'all_risk',
  GENERAL_AVERAGE = 'general_average',
  PARTICULAR_AVERAGE = 'particular_average',
  FREE_OF_PARTICULAR_AVERAGE = 'free_of_particular_average',
  TOTAL_LOSS_ONLY = 'total_loss_only',
  CARGO = 'cargo',
  LIABILITY = 'liability',
}

export enum PolicyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@Entity({ name: 'insurance_policies' })
export class InsurancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  policyNumber: string;

  @Column({ type: 'varchar', length: 255 })
  provider: string;

  @Column({ type: 'enum', enum: CoverageType })
  coverageType: CoverageType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  coverageAmount: number;

  @Column({ type: 'decimal', precision: 8, scale: 4 })
  premiumAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  deductible?: number;

  @Column({ type: 'timestamptz' })
  effectiveDate: Date;

  @Column({ type: 'timestamptz' })
  expiryDate: Date;

  @Column({ type: 'enum', enum: PolicyStatus, default: PolicyStatus.PENDING })
  status: PolicyStatus;

  @Column({ type: 'text', nullable: true })
  termsAndConditions?: string;

  @Column({ type: 'text', nullable: true })
  exclusions?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactPerson?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactEmail?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactPhone?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relationship with Shipment
  @Column({ type: 'uuid' })
  shipmentId: string;

  @ManyToOne(() => Shipment, (shipment) => shipment.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  // Relationship with Claim History
  @OneToMany(() => ClaimHistory, (claim) => claim.insurancePolicy)
  claimHistory: ClaimHistory[];
}
