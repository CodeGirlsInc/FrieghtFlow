import { IsOptional, IsEnum, IsDateString, IsUUID } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { SLAType, SLAPriority } from "../entities/sla-rule.entity"
import { ViolationStatus } from "../entities/sla-violation.entity"

export class SLAMonitoringQueryDto {
  @ApiPropertyOptional({ description: "Filter by shipment ID" })
  @IsOptional()
  @IsUUID()
  shipmentId?: string

  @ApiPropertyOptional({ enum: SLAType, description: "Filter by SLA type" })
  @IsOptional()
  @IsEnum(SLAType)
  ruleType?: SLAType

  @ApiPropertyOptional({ enum: SLAPriority, description: "Filter by SLA priority" })
  @IsOptional()
  @IsEnum(SLAPriority)
  priority?: SLAPriority

  @ApiPropertyOptional({ enum: ViolationStatus, description: "Filter by violation status" })
  @IsOptional()
  @IsEnum(ViolationStatus)
  violationStatus?: ViolationStatus

  @ApiPropertyOptional({ description: "Filter violations from this date" })
  @IsOptional()
  @IsDateString()
  fromDate?: string

  @ApiPropertyOptional({ description: "Filter violations to this date" })
  @IsOptional()
  @IsDateString()
  toDate?: string
}
