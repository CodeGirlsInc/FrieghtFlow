import { IsEnum, IsOptional, IsDateString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { ShipmentStatus } from "../entities/shipment.entity"

export class UpdateShipmentStatusDto {
  @ApiProperty({ enum: ShipmentStatus, description: "New shipment status" })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus

  @ApiPropertyOptional({ description: "Timestamp for the status update" })
  @IsOptional()
  @IsDateString()
  timestamp?: string
}
