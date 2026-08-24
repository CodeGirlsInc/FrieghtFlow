import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentStatus } from '../enums/payment-status.enum';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shipmentId: string;

  @Column('decimal', { precision: 18, scale: 6 })
  amount: number;

  @Column({ default: 'USDC' })
  currency: string;

  @Column('decimal', { precision: 18, scale: 6, default: 0 })
  feeAmount: number;

  @Column('decimal', { precision: 18, scale: 6, default: 0 })
  insurancePremium: number;

  @Column({
    type: 'varchar',
    default: PaymentStatus.INITIATED,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  transactionHash?: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'int', default: 0 })
  consecutiveNotFoundCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastPolledAt?: Date;

  @Column({ nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
