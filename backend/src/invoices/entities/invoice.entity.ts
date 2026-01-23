import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  freightJobId: string;

  @Column({ unique: true })
  invoiceNumber: string;

  @Column('decimal')
  amount: number;

  @Column()
  issuedAt: Date;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  pdfUrl: string;
}
