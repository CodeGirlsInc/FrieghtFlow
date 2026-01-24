import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

// Import Carrier separately to handle circular dependency

export enum VehicleType {
  TRUCK = 'truck',
  VAN = 'van',
  CARGO_SHIP = 'cargo_ship',
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  TRAILER = 'trailer'
}

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'carrier_id', type: 'uuid' })
  carrierId: string;

  @ManyToOne(() => require('./carrier.entity').Carrier, (carrier: any) => carrier.vehicles)
  @JoinColumn({ name: 'carrier_id' })
  carrier: any;

  @Column({ 
    type: 'enum', 
    enum: VehicleType,
    name: 'vehicle_type'
  })
  vehicleType: VehicleType;

  @Column({ name: 'license_plate' })
  licensePlate: string;

  @Column({ 
    name: 'capacity_weight', 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    nullable: true
  })
  capacityWeight: number;

  @Column({ 
    name: 'capacity_volume', 
    type: 'decimal', 
    precision: 10, 
    scale: 2,
    nullable: true
  })
  capacityVolume: number;

  @Column({ name: 'year', type: 'int', nullable: true })
  year: number;

  @Column({ name: 'make', nullable: true })
  make: string;

  @Column({ name: 'model', nullable: true })
  model: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}