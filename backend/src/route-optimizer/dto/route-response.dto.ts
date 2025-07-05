import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { OptimizationCriteria, RouteStatus } from "../entities/route.entity"

export class WaypointResponseDto {
  @ApiProperty({ description: "Node ID" })
  nodeId: string

  @ApiProperty({ description: "Latitude coordinate" })
  latitude: number

  @ApiProperty({ description: "Longitude coordinate" })
  longitude: number

  @ApiProperty({ description: "Order in route" })
  order: number

  @ApiPropertyOptional({ description: "Estimated arrival time" })
  estimatedArrival?: string
}

export class RouteInstructionDto {
  @ApiProperty({ description: "Step number" })
  step: number

  @ApiProperty({ description: "Navigation instruction" })
  instruction: string

  @ApiProperty({ description: "Distance for this step in kilometers" })
  distance: number

  @ApiProperty({ description: "Duration for this step in minutes" })
  duration: number

  @ApiProperty({ description: "Coordinates for this step" })
  coordinates: {
    latitude: number
    longitude: number
  }
}

export class AlternativeRouteDto {
  @ApiProperty({ description: "Alternative route ID" })
  id: string

  @ApiProperty({ description: "Total distance in kilometers" })
  distance: number

  @ApiProperty({ description: "Estimated duration in minutes" })
  duration: number

  @ApiPropertyOptional({ description: "Estimated cost" })
  cost?: number

  @ApiProperty({ description: "Route description" })
  description: string
}

export class RouteMetricsDto {
  @ApiProperty({ description: "Algorithms used for calculation" })
  algorithmsUsed: string[]

  @ApiProperty({ description: "Calculation time in milliseconds" })
  calculationTime: number

  @ApiProperty({ description: "Number of nodes evaluated" })
  nodesEvaluated: number

  @ApiProperty({ description: "Whether result came from cache" })
  cacheHit: boolean

  @ApiPropertyOptional({ description: "Age of traffic data in minutes" })
  trafficDataAge?: number
}

export class RouteResponseDto {
  @ApiProperty({ description: "Route ID" })
  id: string

  @ApiProperty({ description: "Source coordinates" })
  source: {
    latitude: number
    longitude: number
  }

  @ApiProperty({ description: "Destination coordinates" })
  destination: {
    latitude: number
    longitude: number
  }

  @ApiProperty({ description: "Route waypoints", type: [WaypointResponseDto] })
  waypoints: WaypointResponseDto[]

  @ApiProperty({ description: "Total distance in kilometers" })
  totalDistance: number

  @ApiProperty({ description: "Estimated duration in minutes" })
  estimatedDuration: number

  @ApiPropertyOptional({ description: "Estimated cost" })
  estimatedCost?: number

  @ApiProperty({ enum: OptimizationCriteria, description: "Optimization criteria used" })
  optimizationCriteria: OptimizationCriteria

  @ApiProperty({ enum: RouteStatus, description: "Route status" })
  status: RouteStatus

  @ApiPropertyOptional({ description: "Alternative routes", type: [AlternativeRouteDto] })
  alternativeRoutes?: AlternativeRouteDto[]

  @ApiProperty({ description: "Route calculation metrics", type: RouteMetricsDto })
  routeMetrics: RouteMetricsDto

  @ApiPropertyOptional({ description: "Turn-by-turn instructions", type: [RouteInstructionDto] })
  routeInstructions?: RouteInstructionDto[]

  @ApiProperty({ description: "When route was calculated" })
  calculatedAt: Date

  @ApiPropertyOptional({ description: "When route expires" })
  expiresAt?: Date
}
