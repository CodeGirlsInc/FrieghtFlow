import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  SHIPMENT_CREATED = 'shipment_created',
  SHIPMENT_ACCEPTED = 'shipment_accepted',
  SHIPMENT_IN_TRANSIT = 'shipment_in_transit',
  SHIPMENT_DELIVERED = 'shipment_delivered',
  SHIPMENT_COMPLETED = 'shipment_completed',
  SHIPMENT_CANCELLED = 'shipment_cancelled',
  SHIPMENT_DISPUTED = 'shipment_disputed',
  SHIPMENT_DISPUTE_RESOLVED = 'shipment_dispute_resolved',
  GENERAL = 'general',
}

@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['userId', 'createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.GENERAL })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}