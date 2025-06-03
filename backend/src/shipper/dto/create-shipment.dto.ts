import {
  IsString,
  IsEmail,
  IsOptional,
  IsDecimal,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsPhoneNumber,
} from "class-validator"
import { ShipmentPriority } from "../entities/shipment.entity"

export class CreateShipmentDto {
  @IsString()
  senderName: string

  @IsEmail()
  senderEmail: string

  @IsPhoneNumber()
  senderPhone: string

  @IsString()
  senderAddress: string

  @IsString()
  recipientName: string

  @IsEmail()
  recipientEmail: string

  @IsPhoneNumber()
  recipientPhone: string

  @IsString()
  recipientAddress: string

  @IsOptional()
  @IsString()
  packageDescription?: string

  @IsDecimal()
  weight: number

  @IsOptional()
  @IsDecimal()
  length?: number

  @IsOptional()
  @IsDecimal()
  width?: number

  @IsOptional()
  @IsDecimal()
  height?: number

  @IsDecimal()
  shippingCost: number

  @IsOptional()
  @IsEnum(ShipmentPriority)
  priority?: ShipmentPriority

  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string

  @IsOptional()
  @IsString()
  specialInstructions?: string

  @IsOptional()
  @IsBoolean()
  requiresSignature?: boolean

  @IsOptional()
  @IsBoolean()
  isFragile?: boolean
}
