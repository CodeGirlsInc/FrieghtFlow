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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
