import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { eager: false, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  url: string;

  @Column()
  secret: string;

  @Column({ type: 'simple-array', nullable: true })
  events: string[] | null;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'last_delivery_status', nullable: true, length: 20 })
  lastDeliveryStatus: string | null;

  @Column({ name: 'last_delivery_at', type: 'timestamptz', nullable: true })
  lastDeliveryAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
