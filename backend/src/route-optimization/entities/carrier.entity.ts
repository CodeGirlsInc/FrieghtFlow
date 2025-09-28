import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum CarrierType {
  AIRLINE = 'airline',
  SHIPPING_LINE = 'shipping_line',
  TRUCKING_COMPANY = 'trucking_company',
  RAILWAY = 'railway',
  COURIER = 'courier',
  LOGISTICS_PROVIDER = 'logistics_provider',
}

export enum CarrierStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BLACKLISTED = 'blacklisted',
}

@Entity('carriers')
@Index(['name'])
@Index(['status'])
@Index(['carrierType'])
@Index(['createdAt'])
export class Carrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CarrierType,
    name: 'carrier_type',
  })
  carrierType: CarrierType;

  @Column({
    type: 'enum',
    enum: CarrierStatus,
    default: CarrierStatus.ACTIVE,
  })
  status: CarrierStatus;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ length: 255, nullable: true })
  contactEmail: string;

  @Column({ length: 50, nullable: true })
  contactPhone: string;

  @Column({ length: 255, nullable: true })
  headquarters: string;

  @Column('json', { nullable: true })
  serviceAreas: string[];

  @Column('json', { nullable: true })
  capabilities: Record<string, any>;

  @Column('json', { nullable: true })
  certifications: Record<string, any>;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  reliabilityScore: number; // 0-100

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  safetyScore: number; // 0-100

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  costScore: number; // 0-100

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  speedScore: number; // 0-100

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
