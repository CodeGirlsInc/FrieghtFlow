import { IsOptional, IsEnum, IsNumber, IsDateString, Min, Max } from "class-validator"
import { Transform } from "class-transformer"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { OptimizationCriteria, RouteStatus } from "../entities/route.entity"

export class QueryRoutesDto {
  @ApiPropertyOptional({ description: "Filter by source latitude" })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Transform(({ value }) => Number.parseFloat(value))
  sourceLatitude?: number

  @ApiPropertyOptional({ description: "Filter by source longitude" })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Transform(({ value }) => Number.parseFloat(value))
  sourceLongitude?: number

  @ApiPropertyOptional({ description: "Filter by destination latitude" })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Transform(({ value }) => Number.parseFloat(value))
  destinationLatitude?: number

  @ApiPropertyOptional({ description: "Filter by destination longitude" })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Transform(({ value }) => Number.parseFloat(value))
  destinationLongitude?: number

  @ApiPropertyOptional({ enum: OptimizationCriteria, description: "Filter by optimization criteria" })
  @IsOptional()
  @IsEnum(OptimizationCriteria)
  optimizationCriteria?: OptimizationCriteria

  @ApiPropertyOptional({ enum: RouteStatus, description: "Filter by route status" })
  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus

  @ApiPropertyOptional({ description: "Filter routes calculated after this date" })
  @IsOptional()
  @IsDateString()
  fromDate?: string

  @ApiPropertyOptional({ description: "Filter routes calculated before this date" })
  @IsOptional()
  @IsDateString()
  toDate?: string

  @ApiPropertyOptional({ description: "Maximum distance filter in kilometers" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number.parseFloat(value))
  maxDistance?: number

  @ApiPropertyOptional({ description: "Minimum distance filter in kilometers" })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number.parseFloat(value))
  minDistance?: number

  @ApiPropertyOptional({ description: "Number of results per page", default: 50, minimum: 1, maximum: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => Number.parseInt(value))
  limit?: number = 50

  @ApiPropertyOptional({ description: "Page offset", default: 0, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => Number.parseInt(value))
  offset?: number = 0

  @ApiPropertyOptional({ description: "Sort order", enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  sortOrder?: "ASC" | "DESC" = "DESC"
}
