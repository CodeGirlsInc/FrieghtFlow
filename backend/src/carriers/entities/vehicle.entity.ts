import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum VehicleStatus {
  ACTIVE = 'Active',
  MAINTENANCE = 'Maintenance',
  INACTIVE = 'Inactive',
}

@Entity('carrier_vehicles')
@Index(['carrierId', 'plateNumber'], { unique: true })
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'carrier_id', type: 'uuid' })
  carrierId: string;

  @Column({ name: 'plate_number' })
  plateNumber: string;

  @Column()
  type: string;

  @Column({ type: 'float' })
  capacity: number;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
