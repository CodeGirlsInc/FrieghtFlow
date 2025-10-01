import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from "class-validator"
import { ShipmentStatus } from "../entities/shipment.entity"

export class TrackingUpdateDto {
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus

  @IsString()
  @IsNotEmpty()
  updateNote: string

  @IsString()
  @IsOptional()
  location?: string

  @IsDateString()
  @IsOptional()
  timestamp?: string
}
