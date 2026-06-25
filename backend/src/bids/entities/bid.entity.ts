import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

export enum BidStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COUNTER_OFFERED = 'COUNTER_OFFERED',
  COUNTER_ACCEPTED = 'COUNTER_ACCEPTED',
  COUNTER_REJECTED = 'COUNTER_REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('bids')
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

  @Column({ name: 'counter_price', type: 'decimal', precision: 14, scale: 2, nullable: true })
  counterPrice: number | null;

  @Column({ name: 'counter_message', type: 'text', nullable: true })
  counterMessage: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @Column({ name: 'counter_offered_at', type: 'timestamptz', nullable: true })
  counterOfferedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
