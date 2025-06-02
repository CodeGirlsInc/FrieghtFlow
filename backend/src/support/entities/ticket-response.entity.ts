import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Ticket } from './ticket.entity';

@Entity()
export class TicketResponse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  responderId: string;

  @Column('text')
  message: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.responses)
  ticket: Ticket;

  @CreateDateColumn()
  createdAt: Date;
}
