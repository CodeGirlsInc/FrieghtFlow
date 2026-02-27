import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';

@Entity('shipments')
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'tracking_number', unique: true })
  trackingNumber: string;

  // ── Relationships ────────────────────────────────────────────────────────────

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'shipper_id' })
  shipper: User;

  @Column({ name: 'shipper_id' })
  shipperId: string;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'carrier_id' })
  carrier: User | null;

  @Column({ name: 'carrier_id', nullable: true, type: 'uuid' })
  carrierId: string | null;

  // ── Route ────────────────────────────────────────────────────────────────────

  @Column()
  origin: string;

  @Column()
  destination: string;

  // ── Cargo ────────────────────────────────────────────────────────────────────

  @Column({ name: 'cargo_description', type: 'text' })
  cargoDescription: string;

  @Column({ name: 'weight_kg', type: 'decimal', precision: 10, scale: 2 })
  weightKg: number;

  @Column({ name: 'volume_cbm', type: 'decimal', precision: 10, scale: 3, nullable: true })
  volumeCbm: number | null;

  // ── Pricing ──────────────────────────────────────────────────────────────────

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  price: number;

  @Column({ default: 'USD', length: 3 })
  currency: string;

  // ── Status ───────────────────────────────────────────────────────────────────

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
  })
  status: ShipmentStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  // ── Dates ────────────────────────────────────────────────────────────────────

  @Column({ name: 'pickup_date', type: 'timestamptz', nullable: true })
  pickupDate: Date | null;

  @Column({ name: 'estimated_delivery_date', type: 'timestamptz', nullable: true })
  estimatedDeliveryDate: Date | null;

  @Column({ name: 'actual_delivery_date', type: 'timestamptz', nullable: true })
  actualDeliveryDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
