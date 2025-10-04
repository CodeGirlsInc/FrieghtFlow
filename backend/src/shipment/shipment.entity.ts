import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ShipmentStatusHistory } from './shipment-status-history.entity';
import { Cargo } from 'src/cargo/entities/cargo.entity';
import { TrackingEvent } from '../tracking/tracking-event.entity';

export enum ShipmentStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  EXCEPTION = 'exception',
}

export enum CargoType {
  GENERAL = 'general',
  PERISHABLE = 'perishable',
  HAZARDOUS = 'hazardous',
  FRAGILE = 'fragile',
  HIGH_VALUE = 'high_value',
  LIVE_ANIMALS = 'live_animals',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity({ name: 'shipments' })
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  trackingId: string;

  @Column({ type: 'varchar', length: 255 })
  origin: string;

  @Column({ type: 'varchar', length: 255 })
  destination: string;

  @Column({ type: 'varchar', length: 100 })
  carrier: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  estimatedDelivery?: Date;

  @Column({ type: 'text', nullable: true })
  freightDetails?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weightKg: number;

  @Column({  nullable: true })
  distanceKm: number;
  
  @Column()
  mode: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  weightUnit?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  dimensions?: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  dimensionUnit?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

   @OneToMany(() => Cargo, (cargo) => cargo.shipment)
  cargoItems: Cargo[];
  @Column('float', { nullable: true })
  currentLatitude?: number;

  @Column('float', { nullable: true })
  currentLongitude?: number;

  @Column({ type: 'timestamptz', nullable: true })
  currentLocationTimestamp?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currentLocationSource?: string;

  // Risk scoring fields
  @Column({
    type: 'enum',
    enum: CargoType,
    default: CargoType.GENERAL,
  })
  cargoType: CargoType;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  riskScore: number;

  @Column({
    type: 'enum',
    enum: RiskLevel,
    default: RiskLevel.LOW,
  })
  riskLevel: RiskLevel;

  @Column({ type: 'json', nullable: true })
  riskFactors: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ShipmentStatusHistory, (history: ShipmentStatusHistory) => history.shipment)
  statusHistory: ShipmentStatusHistory[];

  // Tracking events relation (real-time/historical checkpoints)
  @OneToMany(() => TrackingEvent, (trackingEvent: TrackingEvent) => trackingEvent.shipment, { cascade: false })
  trackingEvents: TrackingEvent[];
}