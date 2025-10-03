// entities/compliance-check.entity.ts
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

export enum CheckStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed',
  WAIVED = 'waived',
  EXPIRED = 'expired',
}

export enum CheckType {
  DOCUMENT_VALIDATION = 'document_validation',
  CONTENT_VERIFICATION = 'content_verification',
  EXPIRY_CHECK = 'expiry_check',
  SIGNATURE_VERIFICATION = 'signature_verification',
  VALUE_VERIFICATION = 'value_verification',
  CLASSIFICATION_CHECK = 'classification_check',
  RESTRICTION_CHECK = 'restriction_check',
  QUOTA_CHECK = 'quota_check',
  SECURITY_SCREENING = 'security_screening',
  OTHER = 'other',
}

export enum CheckPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity({ name: 'compliance_checks' })
export class ComplianceCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  shipmentId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  requirementId?: string;

  @Column({ type: 'enum', enum: CheckType })
  checkType: CheckType;

  @Column({ type: 'varchar', length: 255 })
  checkName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: CheckStatus, default: CheckStatus.PENDING })
  status: CheckStatus;

  @Column({ type: 'enum', enum: CheckPriority, default: CheckPriority.MEDIUM })
  priority: CheckPriority;

  @Column({ type: 'boolean', default: false })
  isAutomated: boolean;

  @Column({ type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ type: 'text', nullable: true })
  validationRules?: string; // JSON string of validation rules

  @Column({ type: 'text', nullable: true })
  result?: string; // JSON string of check results

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  failureReason?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  performedBy?: string;

  @Column({ type: 'timestamptz', nullable: true })
  performedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ type: 'integer', nullable: true })
  retryCount?: number;

  @Column({ type: 'integer', nullable: true })
  maxRetries?: number;

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
