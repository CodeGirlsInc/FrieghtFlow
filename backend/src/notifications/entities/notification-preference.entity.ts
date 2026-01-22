import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('notification_preferences')
@Unique(['userId'])
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column('uuid')
  userId: string;

  @Column('boolean', { default: true })
  emailEnabled: boolean;

  @Column('boolean', { default: true })
  smsEnabled: boolean;

  @Column('boolean', { default: true })
  inAppEnabled: boolean;

  @Column('jsonb', {
    default: () => `'["SHIPMENT_CREATED", "SHIPMENT_ASSIGNED", "STATUS_UPDATED", "DELIVERY_CONFIRMED", "PAYMENT_RECEIVED", "ISSUE_REPORTED"]'`,
  })
  notificationTypes: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
