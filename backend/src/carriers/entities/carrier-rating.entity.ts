import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Carrier } from './carrier.entity';

@Entity('carrier_ratings')
@Unique(['carrier_id', 'rated_by', 'freight_job_id'])
export class CarrierRating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'carrier_id', type: 'uuid' })
  carrierId: string;

  @ManyToOne(() => Carrier, (carrier: Carrier) => carrier.ratings)
  @JoinColumn({ name: 'carrier_id' })
  carrier: Carrier;

  @Column({ name: 'rated_by', type: 'uuid' })
  ratedBy: string;

  @Column({ name: 'freight_job_id', type: 'uuid', nullable: true })
  freightJobId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  review: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}