import { Shipment } from 'src/shipment';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @CreateDateColumn()
  issuedAt: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.trackingEvents, {
    eager: false,
  })
  @JoinColumn({ name: 'shipmentId' })
  shipment: Shipment;

  @Column()
  shipmentId: string;
}
