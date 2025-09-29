import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RequirementType {
  DOCUMENT = 'document',
  COMPLIANCE_CHECK = 'compliance_check',
  DECLARATION = 'declaration',
  PERMIT = 'permit',
  LICENSE = 'license',
}

export enum RequirementStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DEPRECATED = 'deprecated',
}

@Entity({ name: 'customs_requirements' })
export class CustomsRequirement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  requirementCode: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: RequirementType })
  type: RequirementType;

  @Column({ type: 'varchar', length: 3 })
  @Index()
  originCountry: string;

  @Column({ type: 'varchar', length: 3 })
  @Index()
  destinationCountry: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  shipmentType?: string; // air, sea, road, rail

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  cargoType?: string; // general, hazardous, perishable, etc.

  @Column({ type: 'boolean', default: true })
  isMandatory: boolean;

  @Column({ type: 'boolean', default: false })
  isConditional: boolean;

  @Column({ type: 'text', nullable: true })
  conditions?: string; // JSON string of conditions when isConditional is true

  @Column({ type: 'integer', nullable: true })
  validityDays?: number; // Document validity period in days

  @Column({ type: 'text', nullable: true })
  validationRules?: string; // JSON string of validation rules

  @Column({ type: 'text', nullable: true })
  documentFormat?: string; // Required document format (PDF, XML, etc.)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minValue?: number; // Minimum shipment value for this requirement

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxValue?: number; // Maximum shipment value for this requirement

  @Column({ type: 'enum', enum: RequirementStatus, default: RequirementStatus.ACTIVE })
  status: RequirementStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authority?: string; // Customs authority that enforces this requirement

  @Column({ type: 'text', nullable: true })
  referenceUrl?: string; // Link to official documentation

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
