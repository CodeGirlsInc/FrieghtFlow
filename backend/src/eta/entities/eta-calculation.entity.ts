import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('eta_calculations')
export class ETACalculation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  originCity: string;

  @Column()
  destinationCity: string;

  @Column({ name: 'carrier_id', nullable: true, type: 'uuid' })
  carrierId: string | null;

  @Column({ name: 'base_duration_hours', type: 'float' })
  baseDurationHours: number;

  @Column({ name: 'buffer_hours', type: 'float', default: 0 })
  bufferHours: number;

  @Column({ name: 'total_estimated_hours', type: 'float' })
  totalEstimatedHours: number;

  @Column({ name: 'estimated_delivery_date', type: 'timestamptz' })
  estimatedDeliveryDate: Date;

  @Column({ length: 20, default: 'medium' })
  confidenceLevel: string;

  @Column({ name: 'shipment_id', nullable: true, type: 'uuid' })
  shipmentId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
