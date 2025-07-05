import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsObject, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { RewardSource } from "../entities/reward-transaction.entity"

export class RewardEventDto {
  @ApiProperty({ description: "User ID", example: "user-123" })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: "Source of the reward", enum: RewardSource })
  @IsEnum(RewardSource)
  source: RewardSource

  @ApiPropertyOptional({ description: "Reference ID (e.g., shipment ID)", example: "shipment-456" })
  @IsOptional()
  @IsString()
  referenceId?: string

  @ApiPropertyOptional({ description: "Custom points override", example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPoints?: number

  @ApiPropertyOptional({ description: "Additional metadata", example: { rating: 5, category: "electronics" } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
