import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { PaymentStatus } from '../../common/enums/payment-status.enum';

@Entity('payments')
@Unique(['shipmentId'])
@Unique(['onChainShipmentId'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, { nullable: false, eager: false })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Index({ unique: true })
  @Column({ name: 'shipment_id', type: 'uuid' })
  shipmentId: string;

  @Index({ unique: true })
  @Column({
    name: 'on_chain_shipment_id',
    type: 'bigint',
    unsigned: true,
  })
  onChainShipmentId: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ name: 'asset_code', length: 12, default: 'USDC' })
  assetCode: string;

  @Column({ name: 'token_contract_address', length: 64, nullable: true })
  tokenContractAddress: string | null;

  @Column({ name: 'shipper_wallet_address', length: 64, nullable: true })
  shipperWalletAddress: string | null;

  @Column({ name: 'carrier_wallet_address', length: 64, nullable: true })
  carrierWalletAddress: string | null;

  @Column({ name: 'funded_at', type: 'timestamptz', nullable: true })
  fundedAt: Date | null;

  @Column({ name: 'settled_at', type: 'timestamptz', nullable: true })
  settledAt: Date | null;

  // Set once submitFunding() successfully reaches Horizon/Soroban RPC.
  @Column({ name: 'stellar_tx_hash', length: 64, nullable: true })
  stellarTxHash: string | null;

  // Typed failure code (see errors/payment-flow.errors.ts), not a raw
  // stack trace — safe to surface back to the shipper-facing client.
  @Column({ name: 'failure_reason', length: 64, nullable: true })
  failureReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
