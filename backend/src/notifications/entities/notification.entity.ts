import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export enum NotificationType {
  SHIPMENT_CREATED = 'SHIPMENT_CREATED',
  SHIPMENT_ASSIGNED = 'SHIPMENT_ASSIGNED',
  STATUS_UPDATED = 'STATUS_UPDATED',
  DELIVERY_CONFIRMED = 'DELIVERY_CONFIRMED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  ISSUE_REPORTED = 'ISSUE_REPORTED',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  userId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('varchar')
  title: string;

  @Column('text')
  message: string;

  @Column('boolean', { default: false })
  isRead: boolean;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
