import { IsString, IsEnum, IsUUID, IsDateString, IsOptional, IsObject } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { ShipmentPriority } from "../entities/shipment.entity"

export class CreateShipmentDto {
  @ApiProperty({ description: "Unique tracking number", example: "TRK123456789" })
  @IsString()
  trackingNumber: string

  @ApiProperty({ description: "Customer ID", example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  customerId: string

  @ApiProperty({ description: "Origin location", example: "New York, NY" })
  @IsString()
  origin: string

  @ApiProperty({ description: "Destination location", example: "Los Angeles, CA" })
  @IsString()
  destination: string

  @ApiProperty({ enum: ShipmentPriority, description: "Shipment priority" })
  @IsEnum(ShipmentPriority)
  priority: ShipmentPriority

  @ApiProperty({ description: "Expected delivery date and time", example: "2024-01-15T10:00:00Z" })
  @IsDateString()
  expectedDeliveryAt: string

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
