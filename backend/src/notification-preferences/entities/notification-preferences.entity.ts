import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @Column({ name: 'shipment_accepted', default: true })
  shipmentAccepted: boolean;

  @Column({ name: 'shipment_in_transit', default: true })
  shipmentInTransit: boolean;

  @Column({ name: 'shipment_delivered', default: true })
  shipmentDelivered: boolean;

  @Column({ name: 'shipment_completed', default: true })
  shipmentCompleted: boolean;

  @Column({ name: 'shipment_cancelled', default: true })
  shipmentCancelled: boolean;

  @Column({ name: 'shipment_disputed', default: true })
  shipmentDisputed: boolean;

  @Column({ name: 'dispute_resolved', default: true })
  disputeResolved: boolean;

  // SMS notification toggles
  @Column({ name: 'sms_enabled', default: false })
  smsEnabled: boolean;

  @Column({ name: 'sms_shipment_accepted', default: true })
  smsShipmentAccepted: boolean;

  @Column({ name: 'sms_shipment_in_transit', default: true })
  smsShipmentInTransit: boolean;

  @Column({ name: 'sms_shipment_delivered', default: true })
  smsShipmentDelivered: boolean;

  @Column({ name: 'sms_shipment_completed', default: true })
  smsShipmentCompleted: boolean;

  @Column({ name: 'sms_shipment_cancelled', default: true })
  smsShipmentCancelled: boolean;

  @Column({ name: 'sms_shipment_disputed', default: true })
  smsShipmentDisputed: boolean;

  @Column({ name: 'sms_dispute_resolved', default: true })
  smsDisputeResolved: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}