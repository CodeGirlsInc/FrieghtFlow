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
}

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Shipment, { eager: false, nullable: false, onDelete: 'CASCADE' })
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
