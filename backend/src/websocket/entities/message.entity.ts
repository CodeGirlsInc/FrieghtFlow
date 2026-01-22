import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('messages')
@Index(['freight_job_id', 'sent_at'])
@Index(['sender_id'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'freight_job_id' })
  freightJobId: string;

  @Column({ type: 'uuid', name: 'sender_id' })
  senderId: string;

  @Column({ type: 'text', name: 'message_content' })
  messageContent: string;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ type: 'timestamp', name: 'sent_at' })
  sentAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;
}

