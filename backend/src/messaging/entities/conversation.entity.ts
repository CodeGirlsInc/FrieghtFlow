import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Unique(['shipmentId'])
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @Column({ name: 'shipper_id' })
  shipperId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'shipper_id' })
  shipper: User;

  @Column({ name: 'carrier_id' })
  carrierId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'carrier_id' })
  carrier: User;

  @Column({ name: 'last_message_at', type: 'timestamptz', nullable: true })
  lastMessageAt: Date | null;

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
