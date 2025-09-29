import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum MaintenanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class MaintenanceRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  carrierId: string; // The ID of the carrier/company that owns the vehicle

  @Column()
  vehicleId: string; // e.g., license plate or internal vehicle number

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  priority: MaintenancePriority;

  @Column({
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.PENDING,
  })
  status: MaintenanceStatus;

  @Column({ nullable: true })
  assignedTechnician?: string;

  @Column({ nullable: true })
  resolutionNotes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}