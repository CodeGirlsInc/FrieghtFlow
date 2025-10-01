import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { RouteSegment } from './route-segment.entity';
import { RouteOptimizationRequest } from './route-optimization-request.entity';

export enum RouteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DISCONTINUED = 'discontinued',
}

export enum RouteType {
  DOMESTIC = 'domestic',
  INTERNATIONAL = 'international',
  INTERMODAL = 'intermodal',
  EXPRESS = 'express',
  STANDARD = 'standard',
}

export enum OptimizationAlgorithm {
  DIJKSTRA = 'dijkstra',
  A_STAR = 'a_star',
  GENETIC = 'genetic',
  SIMULATED_ANNEALING = 'simulated_annealing',
  ANT_COLONY = 'ant_colony',
}

@Entity('routes')
@Index(['origin', 'destination'])
@Index(['status'])
@Index(['routeType'])
@Index(['createdAt'])
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 255 })
  origin: string;

  @Column({ length: 255 })
  destination: string;

  @Column({
    type: 'enum',
    enum: RouteType,
    name: 'route_type',
  })
  routeType: RouteType;

  @Column({
    type: 'enum',
    enum: RouteStatus,
    default: RouteStatus.ACTIVE,
  })
  status: RouteStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalDistance: number;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedDuration: number; // in hours

  @Column('decimal', { precision: 10, scale: 2 })
  baseCost: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  carbonFootprint: number; // CO2 emissions in kg

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  reliabilityScore: number; // 0-100

  @Column('decimal', { precision: 5, scale: 2, default: 0 })
  safetyScore: number; // 0-100

  @Column('json', { nullable: true })
  metadata: Record<string, any>;

  @Column('json', { nullable: true })
  restrictions: Record<string, any>;

  @Column('json', { nullable: true })
  capabilities: Record<string, any>;

  @Column({
    type: 'enum',
    enum: OptimizationAlgorithm,
    name: 'optimization_algorithm',
    default: OptimizationAlgorithm.DIJKSTRA,
  })
  optimizationAlgorithm: OptimizationAlgorithm;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RouteSegment, segment => segment.route)
  segments: RouteSegment[];

  @OneToMany(() => RouteOptimizationRequest, request => request.route)
  optimizationRequests: RouteOptimizationRequest[];
}
