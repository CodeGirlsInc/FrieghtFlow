import { IsOptional, IsEnum, IsString, IsDateString, IsNumber, Min, Max, IsArray } from "class-validator"
import { Transform, Type } from "class-transformer"
import { AuditEventType, AuditSeverity, AuditStatus } from "../types/audit.types"

export class AuditLogFilterDto {
  @IsOptional()
  @IsArray()
  @IsEnum(AuditEventType, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  eventType?: AuditEventType[]

  @IsOptional()
  @IsArray()
  @IsEnum(AuditSeverity, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  severity?: AuditSeverity[]

  @IsOptional()
  @IsArray()
  @IsEnum(AuditStatus, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  status?: AuditStatus[]

  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsString()
  userEmail?: string

  @IsOptional()
  @IsString()
  module?: string

  @IsOptional()
  @IsString()
  resource?: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @IsString()
  ipAddress?: string

  @IsOptional()
  @IsString()
  searchTerm?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 50

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"
}
