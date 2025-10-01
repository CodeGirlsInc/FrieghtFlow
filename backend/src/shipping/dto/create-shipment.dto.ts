import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString, Min } from "class-validator"
import { ShipmentPriority } from "../entities/shipment.entity"

export class CreateShipmentDto {
  @IsString()
  @IsNotEmpty()
  originAddress: string

  @IsString()
  @IsNotEmpty()
  originCity: string

  @IsString()
  @IsNotEmpty()
  originState: string

  @IsString()
  @IsNotEmpty()
  originCountry: string

  @IsString()
  @IsNotEmpty()
  originPostalCode: string

  @IsString()
  @IsNotEmpty()
  destinationAddress: string

  @IsString()
  @IsNotEmpty()
  destinationCity: string

  @IsString()
  @IsNotEmpty()
  destinationState: string

  @IsString()
  @IsNotEmpty()
  destinationCountry: string

  @IsString()
  @IsNotEmpty()
  destinationPostalCode: string

  @IsString()
  @IsNotEmpty()
  cargoDescription: string

  @IsNumber()
  @Min(0)
  cargoWeight: number

  @IsNumber()
  @Min(0)
  cargoVolume: number

  @IsNumber()
  @Min(1)
  cargoQuantity: number

  @IsString()
  @IsNotEmpty()
  cargoUnit: string

  @IsNumber()
  @Min(0)
  cargoValue: number

  @IsString()
  @IsNotEmpty()
  cargoCurrency: string

  @IsString()
  @IsNotEmpty()
  assignedCarrier: string

  @IsString()
  @IsOptional()
  carrierContactInfo?: string

  @IsString()
  @IsOptional()
  vehicleInfo?: string

  @IsString()
  @IsOptional()
  driverInfo?: string

  @IsEnum(ShipmentPriority)
  @IsOptional()
  priority?: ShipmentPriority

  @IsDateString()
  @IsOptional()
  scheduledPickupDate?: string

  @IsDateString()
  @IsOptional()
  estimatedDeliveryDate?: string

  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCost?: number

  @IsString()
  @IsOptional()
  costCurrency?: string

  @IsString()
  @IsOptional()
  specialInstructions?: string
}
