import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Shipment } from './shipment.entity';
import { User } from '../../users/entities/user.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';

@Entity('shipment_status_history')
export class ShipmentStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment: Shipment;

  @Column({ name: 'shipment_id' })
  shipmentId: string;

  @Column({
    name: 'from_status',
    type: 'enum',
    enum: ShipmentStatus,
    nullable: true,
  })
  fromStatus: ShipmentStatus | null;

  @Column({
    name: 'to_status',
    type: 'enum',
    enum: ShipmentStatus,
  })
  toStatus: ShipmentStatus;

  @ManyToOne(() => User, { eager: false, nullable: false })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;

  @Column({ name: 'changed_by_id' })
  changedById: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
