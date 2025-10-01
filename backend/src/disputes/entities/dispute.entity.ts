import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Partner } from '../../partner/entities/partner.entity';

export enum DisputeStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
}

export enum DisputeCategory {
  DAMAGED_CARGO = 'damaged_cargo',
  DELAYED_DELIVERY = 'delayed_delivery',
  OTHER = 'other',
}

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: DisputeCategory, default: DisputeCategory.OTHER })
  category: DisputeCategory;

  @Column({ type: 'enum', enum: DisputeStatus, default: DisputeStatus.PENDING })
  status: DisputeStatus;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @Column('simple-array', { nullable: true })
  evidenceUrls?: string[];

  @ManyToOne(() => User, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'raisedByUserId' })
  raisedByUser?: User | null;

  @Column({ type: 'uuid', nullable: true })
  raisedByUserId?: string;

  @ManyToOne(() => Partner, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'againstPartnerId' })
  againstPartner?: Partner | null;

  @Column({ type: 'uuid', nullable: true })
  againstPartnerId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}