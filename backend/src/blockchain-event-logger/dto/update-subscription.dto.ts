import { IsOptional, IsEnum, IsBoolean, IsInt, IsObject, IsString, Min } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { SubscriptionStatus } from "../entities/contract-subscription.entity"

export class UpdateSubscriptionDto {
  @ApiPropertyOptional({ enum: SubscriptionStatus, description: "Update subscription status" })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus

  @ApiPropertyOptional({ description: "Update active state" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: "Update maximum retry attempts", minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRetries?: number

  @ApiPropertyOptional({ description: "Update retry delay in milliseconds", minimum: 1000 })
  @IsOptional()
  @IsInt()
  @Min(1000)
  retryDelayMs?: number

  @ApiPropertyOptional({ description: "Update filter criteria" })
  @IsOptional()
  @IsObject()
  filterCriteria?: Record<string, any>

  @ApiPropertyOptional({ description: "Update description" })
  @IsOptional()
  @IsString()
  description?: string
}
