import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'shipper_id' })
  shipper: User;

  @Column({ name: 'shipper_id' })
  shipperId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'carrier_id' })
  carrier: User;

  @Column({ name: 'carrier_id' })
  carrierId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
