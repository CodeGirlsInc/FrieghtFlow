import { IsEnum, IsOptional, IsString, IsDecimal } from "class-validator"
import { DeliveryStatus } from "../entities/shipment-status.entity"

export class UpdateShipmentStatusDto {
  @IsEnum(DeliveryStatus)
  status: DeliveryStatus

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsDecimal()
  latitude?: number

  @IsOptional()
  @IsDecimal()
  longitude?: number

  @IsOptional()
  @IsString()
  imageUrl?: string
}
