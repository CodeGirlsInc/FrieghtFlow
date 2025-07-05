import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { RedemptionType } from "../entities/redemption.entity"

export class RedemptionRequestDto {
  @ApiProperty({ description: "User ID", example: "user-123" })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({ description: "Type of redemption", enum: RedemptionType })
  @IsEnum(RedemptionType)
  redemptionType: RedemptionType

  @ApiProperty({ description: "Item name", example: "10% Discount Coupon" })
  @IsString()
  @IsNotEmpty()
  itemName: string

  @ApiProperty({ description: "Points required for redemption", example: 500 })
  @IsNumber()
  @Min(1)
  pointsRequired: number

  @ApiPropertyOptional({ description: "Item description", example: "10% off your next purchase" })
  @IsOptional()
  @IsString()
  itemDescription?: string

  @ApiPropertyOptional({ description: "Monetary value", example: 25.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  monetaryValue?: number
}
