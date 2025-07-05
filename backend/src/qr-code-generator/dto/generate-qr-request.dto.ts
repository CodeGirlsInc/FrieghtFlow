import { IsString, IsEnum, IsOptional, IsNumber, IsObject, IsDateString, Min, Max } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { QRCodeType } from "../entities/qr-code.entity"

export class GenerateQRRequestDto {
  @ApiProperty({ description: "Type of QR code", enum: QRCodeType })
  @IsEnum(QRCodeType)
  type: QRCodeType

  @ApiPropertyOptional({ description: "Reference ID (e.g., shipment ID)", example: "shipment-123" })
  @IsOptional()
  @IsString()
  referenceId?: string

  @ApiPropertyOptional({ description: "Description of the QR code", example: "Delivery validation for order #12345" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: "Expiration time in hours", example: 24, minimum: 1, maximum: 8760 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8760) // Max 1 year
  expirationHours?: number

  @ApiPropertyOptional({ description: "Maximum number of scans allowed", example: 1, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxScans?: number

  @ApiPropertyOptional({ description: "Custom expiration date (ISO string)", example: "2024-12-31T23:59:59Z" })
  @IsOptional()
  @IsDateString()
  customExpirationDate?: string

  @ApiPropertyOptional({ description: "Additional metadata", example: { orderId: "12345", priority: "high" } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiPropertyOptional({ description: "Creator identifier", example: "user-123" })
  @IsOptional()
  @IsString()
  createdBy?: string
}
