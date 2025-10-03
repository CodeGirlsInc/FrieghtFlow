import { IsString, IsNumber, IsEnum, IsOptional, IsDateString, IsUUID } from "class-validator"
import { MovementType, MovementStatus } from "../entities/cargo-movement.entity"

export class CreateCargoMovementDto {
  @IsEnum(MovementType)
  type: MovementType

  @IsString()
  cargoDescription: string

  @IsNumber()
  quantity: number

  @IsString()
  unit: string

  @IsUUID()
  warehouse_id: string

  @IsOptional()
  @IsString()
  referenceNumber?: string

  @IsOptional()
  @IsString()
  carrier?: string

  @IsOptional()
  @IsDateString()
  scheduledDateTime?: string

  @IsOptional()
  @IsEnum(MovementStatus)
  status?: MovementStatus

  @IsOptional()
  @IsString()
  notes?: string
}
