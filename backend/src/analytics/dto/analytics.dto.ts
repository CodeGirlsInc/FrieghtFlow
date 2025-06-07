import { IsEnum, IsOptional, IsString, IsDateString, IsObject, IsNumber, Min, Max } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { EventType, type AnalyticsEvent } from "../entities/analytics-event.entity"

export class TrackEventDto {
  @ApiProperty({ enum: EventType })
  @IsEnum(EventType)
  eventType: EventType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  properties?: Record<string, any>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

export class DateRangeDto {
  @ApiProperty()
  @IsDateString()
  startDate: string

  @ApiProperty()
  @IsDateString()
  endDate: string
}

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10
}

export class ShipmentVolumeDto {
  @ApiProperty()
  date: string

  @ApiProperty()
  totalShipments: number

  @ApiProperty()
  deliveredShipments: number

  @ApiProperty()
  cancelledShipments: number

  @ApiProperty()
  pendingShipments: number

  @ApiProperty()
  revenue: number
}

export class UserEngagementDto {
  @ApiProperty()
  date: string

  @ApiProperty()
  activeUsers: number

  @ApiProperty()
  newUsers: number

  @ApiProperty()
  returningUsers: number

  @ApiProperty()
  avgSessionDuration: number

  @ApiProperty()
  pageViews: number
}

export class CarrierPerformanceDto {
  @ApiProperty()
  carrierId: string

  @ApiProperty()
  carrierName: string

  @ApiProperty()
  totalShipments: number

  @ApiProperty()
  successfulDeliveries: number

  @ApiProperty()
  successRate: number

  @ApiProperty()
  avgDeliveryTime: number

  @ApiProperty()
  rating: number
}

export class DashboardMetricsDto {
  @ApiProperty()
  totalUsers: number

  @ApiProperty()
  activeUsers: number

  @ApiProperty()
  totalShipments: number

  @ApiProperty()
  totalRevenue: number

  @ApiProperty()
  avgDeliveryTime: number

  @ApiProperty()
  topCarriers: CarrierPerformanceDto[]

  @ApiProperty()
  recentActivity: AnalyticsEvent[]
}
