import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Carrier } from './carrier.entity';
import { MaintenanceRecord } from './maintenance-record.entity';
import { VehicleType, VehicleStatus } from '../dto/create-vehicle.dto';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  carrierId: string;

  @ManyToOne(() => Carrier, carrier => carrier.vehicles)
  @JoinColumn({ name: 'carrierId' })
  carrier: Carrier;

  @Column({ type: 'enum', enum: VehicleType })
  type: VehicleType;

  @Column({ unique: true })
  registrationNumber: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  capacityWeight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  capacityVolume: number;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  status: VehicleStatus;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentLoad: number;

  @Column({ nullable: true })
  lastMaintenanceDate: Date;

  @Column({ nullable: true })
  nextMaintenanceDate: Date;

  @OneToMany(() => MaintenanceRecord, maintenance => maintenance.vehicle)
  maintenanceRecords: MaintenanceRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}