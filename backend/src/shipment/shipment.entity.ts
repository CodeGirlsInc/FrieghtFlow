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
import { ShipmentLocationHistory } from './entities/shipment-location-history.entity';

export enum ShipmentStatus {
  PENDING = 'pending',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  EXCEPTION = 'exception',
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

  @Column('float', { nullable: true })
  currentLatitude?: number;

  @Column('float', { nullable: true })
  currentLongitude?: number;

  @Column({ type: 'timestamptz', nullable: true })
  currentLocationTimestamp?: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currentLocationSource?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ShipmentStatusHistory, (history) => history.shipment)
  statusHistory: ShipmentStatusHistory[];

  @OneToMany(() => ShipmentLocationHistory, (location) => location.shipment)
  locationHistory: ShipmentLocationHistory[];
}
