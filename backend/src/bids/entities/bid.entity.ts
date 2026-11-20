import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('bids')
// Partial unique index enforced at the DB level: one pending bid per carrier per shipment.
// The constraint is added via migration; this decorator documents the intent.
@Unique('UQ_bids_shipment_carrier_pending', ['shipmentId', 'carrierId'])
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Shipment, {
    eager: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrier_id' })
  carrier: User;

  @Column({ name: 'carrier_id' })
  carrierId: string;

  @Column({ name: 'proposed_price', type: 'decimal', precision: 14, scale: 2 })
  proposedPrice: number;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'enum', enum: BidStatus, default: BidStatus.PENDING })
  status: BidStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
