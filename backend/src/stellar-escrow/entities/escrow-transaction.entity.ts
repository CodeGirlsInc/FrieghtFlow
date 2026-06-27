import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('escrow_transactions')
export class EscrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipment_id', type: 'uuid' })
  shipmentId: string;

  @Column({ type: 'decimal', precision: 20, scale: 7 })
  amount: number;

  @Column({ name: 'token_address', length: 56 })
  tokenAddress: string;

  @Column({ name: 'tx_hash', nullable: true, length: 64 })
  txHash: string | null;

  @Column({ name: 'ledger_number', nullable: true })
  ledgerNumber: number | null;

  @Column({ nullable: true, length: 20 })
  action: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
