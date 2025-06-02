import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TicketResponse } from './ticket-response.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  category: 'billing' | 'delivery' | 'bug' | 'other';

  @Column()
  subject: string;

  @Column('text')
  message: string;

  @Column({ default: 'open' })
  status: 'open' | 'closed' | 'escalated';

  @OneToMany(() => TicketResponse, (response) => response.ticket, {
    cascade: true,
  })
  responses: TicketResponse[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
