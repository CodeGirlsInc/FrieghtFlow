import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Route } from './route.entity';

export enum SegmentType {
  ROAD = 'road',
  RAIL = 'rail',
  AIR = 'air',
  SEA = 'sea',
  RIVER = 'river',
  PIPELINE = 'pipeline',
}

export enum SegmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  CLOSED = 'closed',
}

@Entity('route_segments')
@Index(['routeId'])
@Index(['segmentType'])
@Index(['status'])
@Index(['sequence'])
export class RouteSegment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'route_id' })
  @Index()
  routeId: string;

  @Column({
    type: 'enum',
    enum: SegmentType,
    name: 'segment_type',
  })
  segmentType: SegmentType;

  @Column({ length: 255 })
  origin: string;

  @Column({ length: 255 })
  destination: string;

  @Column('decimal', { precision: 10, scale: 2 })
  distance: number;

  @Column('decimal', { precision: 10, scale: 2 })
  duration: number; // in hours

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column({ length: 3, default: 'USD' })
  currency: string;

  @Column('int')
  sequence: number;

  @Column({
    type: 'enum',
    enum: SegmentStatus,
    default: SegmentStatus.ACTIVE,
  })
  status: SegmentStatus;

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

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Route, route => route.segments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;
}
