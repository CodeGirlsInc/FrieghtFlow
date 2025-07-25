import { IsOptional, IsEnum, IsDateString, IsString, IsNumber, Min, Max } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Transform } from "class-transformer"
import { LogLevel } from "../interfaces/logger.interface"

export class LogQueryDto {
  @ApiPropertyOptional({ enum: LogLevel, description: "Log level filter" })
  @IsOptional()
  @IsEnum(LogLevel)
  level?: LogLevel

  @ApiPropertyOptional({ description: "Start date for log search" })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({ description: "End date for log search" })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({ description: "User ID filter" })
  @IsOptional()
  @IsString()
  userId?: string

  @ApiPropertyOptional({ description: "Request ID filter" })
  @IsOptional()
  @IsString()
  requestId?: string

  @ApiPropertyOptional({ description: "Module filter" })
  @IsOptional()
  @IsString()
  module?: string

  @ApiPropertyOptional({ description: "Component filter" })
  @IsOptional()
  @IsString()
  component?: string

  @ApiPropertyOptional({ description: "Search term in message" })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: "Page number", default: 1 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: "Items per page", default: 50 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 50

  @ApiPropertyOptional({ description: "Sort field", default: "timestamp" })
  @IsOptional()
  @IsString()
  sortBy?: string = "timestamp"

  @ApiPropertyOptional({ description: "Sort order", enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"
}

export class TestLogDto {
  @ApiPropertyOptional({ enum: LogLevel, description: "Log level for test" })
  @IsEnum(LogLevel)
  level: LogLevel

  @ApiPropertyOptional({ description: "Test message" })
  @IsString()
  message: string

  @ApiPropertyOptional({ description: "Include error in test log" })
  @IsOptional()
  includeError?: boolean
}

export class ArchiveLogsDto {
  @ApiPropertyOptional({ description: "Days old to archive", default: 30 })
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  daysOld?: number = 30
}
