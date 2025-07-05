import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from "typeorm"

export enum RouteStatus {
  CALCULATED = "calculated",
  OPTIMIZED = "optimized",
  CACHED = "cached",
  EXPIRED = "expired",
}

export enum OptimizationCriteria {
  DISTANCE = "distance",
  TIME = "time",
  FUEL_EFFICIENCY = "fuel_efficiency",
  TRAFFIC_AVOIDANCE = "traffic_avoidance",
  COST = "cost",
}

@Entity("routes")
@Index(["sourceLatitude", "sourceLongitude"])
@Index(["destinationLatitude", "destinationLongitude"])
@Index(["calculatedAt"])
@Index(["optimizationCriteria", "calculatedAt"])
export class Route {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "decimal", precision: 10, scale: 7 })
  sourceLatitude: number

  @Column({ type: "decimal", precision: 10, scale: 7 })
  sourceLongitude: number

  @Column({ type: "decimal", precision: 10, scale: 7 })
  destinationLatitude: number

  @Column({ type: "decimal", precision: 10, scale: 7 })
  destinationLongitude: number

  @Column({ type: "jsonb" })
  waypoints: Array<{
    nodeId: string
    latitude: number
    longitude: number
    order: number
    estimatedArrival?: string
  }>

  @Column({ type: "decimal", precision: 8, scale: 3 })
  totalDistance: number // in kilometers

  @Column({ type: "int" })
  estimatedDuration: number // in minutes

  @Column({ type: "decimal", precision: 8, scale: 2, nullable: true })
  estimatedCost: number // fuel + tolls

  @Column({
    type: "enum",
    enum: OptimizationCriteria,
    default: OptimizationCriteria.DISTANCE,
  })
  optimizationCriteria: OptimizationCriteria

  @Column({
    type: "enum",
    enum: RouteStatus,
    default: RouteStatus.CALCULATED,
  })
  status: RouteStatus

  @Column({ type: "jsonb", nullable: true })
  alternativeRoutes: Array<{
    id: string
    distance: number
    duration: number
    cost?: number
    description: string
  }>

  @Column({ type: "jsonb", nullable: true })
  routeMetrics: {
    algorithmsUsed: string[]
    calculationTime: number // milliseconds
    nodesEvaluated: number
    cacheHit: boolean
    trafficDataAge?: number // minutes
  }

  @Column({ type: "jsonb", nullable: true })
  routeInstructions: Array<{
    step: number
    instruction: string
    distance: number
    duration: number
    coordinates: {
      latitude: number
      longitude: number
    }
  }>

  @Column({ type: "timestamp" })
  @Index()
  calculatedAt: Date

  @Column({ type: "timestamp", nullable: true })
  expiresAt: Date

  @CreateDateColumn()
  createdAt: Date
}
