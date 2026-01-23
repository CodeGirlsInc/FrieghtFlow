import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export enum FreightJobStatus {
  DRAFT = 'draft',
  POSTED = 'posted',
  ASSIGNED = 'assigned',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

@Entity('freight_jobs')
@Index(['shipperId'])
@Index(['carrierId'])
@Index(['status'])
@Index(['createdAt'])
export class FreightJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  shipperId: string;

  @Column('uuid', { nullable: true })
  carrierId: string;

  @Column('varchar')
  title: string;

  @Column('text')
  description: string;

  @Column('jsonb')
  originAddress: Address;

  @Column('jsonb')
  destinationAddress: Address;

  @Column('varchar')
  cargoType: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cargoWeight: number; // in kg

  @Column('decimal', { precision: 12, scale: 2 })
  estimatedCost: number;

  @Column('enum', { enum: FreightJobStatus, default: FreightJobStatus.DRAFT })
  status: FreightJobStatus;

  @Column('timestamp')
  pickupDate: Date;

  @Column('timestamp')
  deliveryDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
