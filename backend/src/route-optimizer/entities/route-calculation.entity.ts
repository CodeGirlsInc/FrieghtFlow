import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum CalculationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CACHED = "cached",
}

@Entity("route_calculations")
@Index(["status", "createdAt"])
@Index(["calculationTime"])
export class RouteCalculation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid", { nullable: true })
  routeId: string

  @Column({ type: "decimal", precision: 10, scale: 7 })
  sourceLatitude: number

  @Column({ type: "decimal", precision: 10, scale: 7 })
  sourceLongitude: number

  @Column({ type: "decimal", precision: 10, scale: 7 })
  destinationLatitude: number

  @Column({ type: "decimal", precision: 10, scale: 7 })
  destinationLongitude: number

  @Column({
    type: "enum",
    enum: CalculationStatus,
    default: CalculationStatus.PENDING,
  })
  status: CalculationStatus

  @Column({ type: "int", nullable: true })
  calculationTime: number // milliseconds

  @Column({ type: "int", default: 0 })
  nodesEvaluated: number

  @Column({ type: "int", default: 0 })
  edgesEvaluated: number

  @Column({ type: "text", nullable: true })
  errorMessage: string

  @Column({ type: "jsonb", nullable: true })
  requestParameters: {
    optimizationCriteria?: string
    avoidTolls?: boolean
    avoidHighways?: boolean
    vehicleType?: string
    maxDistance?: number
    includeAlternatives?: boolean
  }

  @Column({ type: "jsonb", nullable: true })
  performanceMetrics: {
    memoryUsage?: number // MB
    cpuTime?: number // milliseconds
    cacheHitRate?: number // percentage
    algorithmEfficiency?: number
  }

  @Column({ length: 45, nullable: true })
  clientIpAddress: string

  @Column({ length: 500, nullable: true })
  userAgent: string

  @CreateDateColumn()
  createdAt: Date
}
