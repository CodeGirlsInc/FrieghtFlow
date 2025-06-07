import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsObject,
  IsBoolean,
  IsDateString,
  Min,
  Max,
} from "class-validator"
import { Transform } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { VehicleType, VehicleStatus, FuelType } from "../entities/vehicle.entity"

export class CreateVehicleDto {
  @ApiProperty({ enum: VehicleType })
  @IsEnum(VehicleType)
  vehicleType: VehicleType

  @ApiProperty()
  @IsString()
  make: string

  @ApiProperty()
  @IsString()
  model: string

  @ApiProperty()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number

  @ApiProperty()
  @IsString()
  licensePlate: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin?: string

  @ApiProperty({ enum: FuelType })
  @IsEnum(FuelType)
  fuelType: FuelType

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  loadCapacity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  volumeCapacity?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  dimensions?: {
    length: number
    width: number
    height: number
    unit: string
  }

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  insuranceExpiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  registrationExpiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  inspectionExpiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentMileage?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string
}

export class UpdateVehicleDto {
  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  insurancePolicyNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  insuranceExpiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  registrationExpiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  inspectionExpiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentMileage?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  lastMaintenanceDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextMaintenanceDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  currentLocation?: {
    latitude: number
    longitude: number
    address?: string
  }

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean
}

export class VehicleQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => Number.parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @ApiPropertyOptional({ enum: VehicleType })
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType

  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean
}
