import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Shipment } from 'src/shipment';

@Entity('cargo')
export class Cargo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  value: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Shipment, (shipment) => shipment.cargoItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;
}