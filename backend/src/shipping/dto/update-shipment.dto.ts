import { PartialType } from "@nestjs/mapped-types"
import { IsEnum, IsOptional, IsDateString, IsString } from "class-validator"
import { CreateShipmentDto } from "./create-shipment.dto"
import { ShipmentStatus } from "../entities/shipment.entity"

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {
  @IsEnum(ShipmentStatus)
  @IsOptional()
  status?: ShipmentStatus

  @IsDateString()
  @IsOptional()
  actualPickupDate?: string

  @IsDateString()
  @IsOptional()
  actualDeliveryDate?: string

  @IsString()
  @IsOptional()
  trackingNotes?: string
}
