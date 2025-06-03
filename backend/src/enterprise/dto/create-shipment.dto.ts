import { IsString, IsNumber, IsEnum, IsOptional, IsObject, IsUUID, IsNotEmpty, IsDateString } from "class-validator"
import { ShipmentPriority } from "../entities/shipment.entity"

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  senderName: string

  @IsString()
  @IsNotEmpty()
  senderAddress: string

  @IsString()
  @IsNotEmpty()
  recipientName: string

  @IsString()
  @IsNotEmpty()
  recipientAddress: string

  @IsNumber()
  weight: number

  @IsObject()
  @IsOptional()
  dimensions?: { length: number; width: number; height: number }

  @IsEnum(ShipmentPriority)
  @IsOptional()
  priority?: ShipmentPriority

  @IsNumber()
  cost: number

  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string

  @IsString()
  @IsOptional()
  notes?: string

  @IsUUID()
  organizationId: string

  @IsUUID()
  departmentId: string

  @IsUUID()
  @IsOptional()
  assignedUserId?: string

  @IsUUID()
  @IsOptional()
  routeId?: string
}
