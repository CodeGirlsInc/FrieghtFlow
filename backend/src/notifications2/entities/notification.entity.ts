
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // If you have a User entity later, you can use ManyToOne

  @Column()
  type: string; // e.g. 'SHIPMENT_DELIVERED', 'INVOICE_DUE'

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.UNREAD })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;
}
