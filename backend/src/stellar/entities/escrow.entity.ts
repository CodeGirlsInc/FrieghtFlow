import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Partner } from '../../partner/entities/partner.entity';

export enum EscrowStatus {
  PENDING_FUNDING = 'pending_funding',
  FUNDED = 'funded',
  RELEASED = 'released',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

@Entity('escrows')
export class EscrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', precision: 18, scale: 7 })
  amount: string; // stored as string to preserve precision

  @Column({ type: 'varchar', length: 12, default: 'XLM' })
  assetCode: string;

  @Column({ type: 'varchar', length: 56, nullable: true })
  assetIssuer?: string | null; // null for native (XLM)

  @Column({ type: 'enum', enum: EscrowStatus, default: EscrowStatus.PENDING_FUNDING })
  status: EscrowStatus;

  @Column({ type: 'varchar', length: 56 })
  escrowAccountPublic: string; // platform escrow account

  @Column({ type: 'varchar', length: 28 })
  depositMemo: string; // unique memo to identify funding transaction

  @Column({ type: 'varchar', length: 56 })
  carrierStellarAddress: string; // destination for release

  @Column({ type: 'varchar', length: 56 })
  shipperStellarAddress: string; // destination for refund

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'shipperUserId' })
  shipperUser?: User | null;

  @Column({ type: 'uuid', nullable: true })
  shipperUserId?: string | null;

  @ManyToOne(() => Partner, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'carrierPartnerId' })
  carrierPartner?: Partner | null;

  @Column({ type: 'uuid', nullable: true })
  carrierPartnerId?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  fundingTxHash?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  releaseTxHash?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  refundTxHash?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fundedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}