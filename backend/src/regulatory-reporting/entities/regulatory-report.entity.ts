import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ReportType {
  COMPLIANCE_SUMMARY = 'compliance_summary',
  CUSTOMS_DOCUMENTS = 'customs_documents',
  COMPLIANCE_CHECKS = 'compliance_checks',
  REGULATORY_OVERVIEW = 'regulatory_overview',
  SHIPMENT_COMPLIANCE = 'shipment_compliance',
}

export enum ReportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity({ name: 'regulatory_reports' })
export class RegulatoryReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ReportType })
  @Index()
  type: ReportType;

  @Column({ type: 'enum', enum: ReportFormat })
  format: ReportFormat;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  shipmentId?: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  @Index()
  originCountry?: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  @Index()
  destinationCountry?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  shipmentType?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cargoType?: string;

  @Column({ type: 'timestamptz', nullable: true })
  startDate?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endDate?: Date;

  @Column({ type: 'text', nullable: true })
  filters?: string; // JSON string of additional filters

  @Column({ type: 'text', nullable: true })
  generatedData?: string; // JSON string of generated report data

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileUrl?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fileName?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'uuid', nullable: true })
  generatedBy?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt?: Date;
}