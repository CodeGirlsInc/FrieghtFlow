import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from './route.entity';

export enum OptimizationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum OptimizationCriteria {
  COST = 'cost',
  TIME = 'time',
  DISTANCE = 'distance',
  CARBON_FOOTPRINT = 'carbon_footprint',
  RELIABILITY = 'reliability',
  SAFETY = 'safety',
  COMBINED = 'combined',
}

@Entity('route_optimization_requests')
@Index(['requesterId'])
@Index(['status'])
@Index(['criteria'])
@Index(['createdAt'])
export class RouteOptimizationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'requester_id' })
  @Index()
  requesterId: string;

  @Column({ name: 'route_id', nullable: true })
  @Index()
  routeId: string;

  @Column({ length: 255 })
  origin: string;

  @Column({ length: 255 })
  destination: string;

  @Column({
    type: 'enum',
    enum: OptimizationCriteria,
    default: OptimizationCriteria.COMBINED,
  })
  criteria: OptimizationCriteria;

  @Column({
    type: 'enum',
    enum: OptimizationStatus,
    default: OptimizationStatus.PENDING,
  })
  status: OptimizationStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  volume: number;

  @Column({ length: 255, nullable: true })
  cargoType: string;

  @Column('json', { nullable: true })
  constraints: Record<string, any>;

  @Column('json', { nullable: true })
  preferences: Record<string, any>;

  @Column('json', { nullable: true })
  results: Record<string, any>;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  optimizedCost: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  optimizedDistance: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  optimizedDuration: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  optimizedCarbonFootprint: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  optimizedReliabilityScore: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  optimizedSafetyScore: number;

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Route, route => route.optimizationRequests, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'route_id' })
  route: Route;
}
