import { IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested, Min, Max } from "class-validator"
import { Type } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { OptimizationCriteria } from "../entities/route.entity"

class CoordinateDto {
  @ApiProperty({ description: "Latitude coordinate", example: 40.7128, minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @ApiProperty({ description: "Longitude coordinate", example: -74.006, minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number
}

class WaypointDto extends CoordinateDto {
  @ApiPropertyOptional({ description: "Order of waypoint in route", example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number

  @ApiPropertyOptional({ description: "Name or description of waypoint" })
  @IsOptional()
  name?: string
}

export class CalculateRouteDto {
  @ApiProperty({ description: "Source coordinates", type: CoordinateDto })
  @ValidateNested()
  @Type(() => CoordinateDto)
  source: CoordinateDto

  @ApiProperty({ description: "Destination coordinates", type: CoordinateDto })
  @ValidateNested()
  @Type(() => CoordinateDto)
  destination: CoordinateDto

  @ApiPropertyOptional({
    description: "Intermediate waypoints",
    type: [WaypointDto],
    example: [{ latitude: 40.7589, longitude: -73.9851, order: 1 }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WaypointDto)
  waypoints?: WaypointDto[]

  @ApiPropertyOptional({
    enum: OptimizationCriteria,
    description: "Optimization criteria for route calculation",
    default: OptimizationCriteria.DISTANCE,
  })
  @IsOptional()
  @IsEnum(OptimizationCriteria)
  optimizationCriteria?: OptimizationCriteria

  @ApiPropertyOptional({ description: "Avoid toll roads", default: false })
  @IsOptional()
  @IsBoolean()
  avoidTolls?: boolean

  @ApiPropertyOptional({ description: "Avoid highways", default: false })
  @IsOptional()
  @IsBoolean()
  avoidHighways?: boolean

  @ApiPropertyOptional({ description: "Vehicle type for route optimization", example: "truck" })
  @IsOptional()
  vehicleType?: string

  @ApiPropertyOptional({ description: "Maximum route distance in kilometers", minimum: 1, maximum: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10000)
  maxDistance?: number

  @ApiPropertyOptional({ description: "Include alternative routes", default: false })
  @IsOptional()
  @IsBoolean()
  includeAlternatives?: boolean

  @ApiPropertyOptional({ description: "Use cached routes if available", default: true })
  @IsOptional()
  @IsBoolean()
  useCache?: boolean
}
