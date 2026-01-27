
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum BlockchainTxStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

@Entity('blockchain_transactions')
export class BlockchainTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  freight_job_id: string;

  @Column()
  event_type: string;

  @Column({ unique: true })
  transaction_hash: string;

  @Column({ type: 'bigint', nullable: true })
  block_number: number;

  @Column({
    type: 'enum',
    enum: BlockchainTxStatus,
    default: BlockchainTxStatus.PENDING,
  })
  status: BlockchainTxStatus;

  @Column({ nullable: true })
  gas_used: string;

  @Column()
  network: string; // starknet | soroban

  @Column({ type: 'jsonb' })
  event_data: any;

  @CreateDateColumn()
  created_at: Date;

  @Column({ nullable: true })
  confirmed_at?: Date;
}
