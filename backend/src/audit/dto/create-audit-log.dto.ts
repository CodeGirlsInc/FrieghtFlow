import { IsEnum, IsString, IsOptional, IsObject, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { AuditEventType, AuditSeverity, AuditStatus } from "../types/audit.types"

export class AuditContextDto {
  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsString()
  userEmail?: string

  @IsOptional()
  @IsString()
  userRole?: string

  @IsOptional()
  @IsString()
  sessionId?: string

  @IsOptional()
  @IsString()
  ipAddress?: string

  @IsOptional()
  @IsString()
  userAgent?: string

  @IsOptional()
  @IsString()
  requestId?: string

  @IsOptional()
  @IsString()
  correlationId?: string

  @IsOptional()
  @IsString()
  module?: string

  @IsOptional()
  @IsString()
  action?: string

  @IsOptional()
  @IsString()
  resource?: string

  @IsOptional()
  @IsString()
  resourceId?: string

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>
}

export class CreateAuditLogDto {
  @IsEnum(AuditEventType)
  eventType: AuditEventType

  @IsEnum(AuditSeverity)
  severity: AuditSeverity

  @IsEnum(AuditStatus)
  status: AuditStatus

  @IsString()
  message: string

  @ValidateNested()
  @Type(() => AuditContextDto)
  context: AuditContextDto

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @IsOptional()
  @IsObject()
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
}
