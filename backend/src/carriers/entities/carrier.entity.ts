import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { CarrierRating } from './carrier-rating.entity';

// Import Vehicle to satisfy TypeScript type checking despite circular dependency
import { Vehicle } from './vehicle.entity';

@Entity('carriers')
@Unique(['license_number'])
export class Carrier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'company_name' })
  companyName: string;

  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({ name: 'insurance_policy', nullable: true })
  insurancePolicy: string;

  @Column({ name: 'service_areas', type: 'jsonb', nullable: true })
  serviceAreas: string[];

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ name: 'total_deliveries', type: 'int', default: 0 })
  totalDeliveries: number;

  @Column({ name: 'on_time_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  onTimePercentage: number;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => require('./vehicle.entity').Vehicle, (vehicle: any) => vehicle.carrier)
  vehicles: Vehicle[];

  @OneToMany(() => CarrierRating, (rating: CarrierRating) => rating.carrier)
  ratings: CarrierRating[];
}