import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum NotificationEventType {
  BID_PLACED = 'BID_PLACED',
  BID_ACCEPTED = 'BID_ACCEPTED',
  SHIPMENT_PICKED_UP = 'SHIPMENT_PICKED_UP',
  SHIPMENT_DELIVERED = 'SHIPMENT_DELIVERED',
  DISPUTE_OPENED = 'DISPUTE_OPENED',
}

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
}

@Entity('notification_preferences_v2')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'event_type', type: 'enum', enum: NotificationEventType })
  eventType: NotificationEventType;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ default: true })
  enabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
