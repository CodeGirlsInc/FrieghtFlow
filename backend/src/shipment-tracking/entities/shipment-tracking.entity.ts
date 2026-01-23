
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ShipmentStatus {
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  PENDING = 'pending',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  EXCEPTION = 'exception',
}

@Entity('tracking_events')
@Index(['shipmentId', 'timestamp'])
export class TrackingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  shipmentId: string;

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.IN_TRANSIT,
  })
  status: ShipmentStatus;

  @Column('timestamp')
  @Index()
  timestamp: Date;

  @Column('uuid')
  recordedBy: string;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
