import { IsEnum, IsNumber, IsBoolean, IsOptional, Min } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { CargoType } from "../entities/freight-quote.entity"

export class CreatePricingConfigDto {
  @ApiProperty({ enum: CargoType, description: "Type of cargo this pricing applies to" })
  @IsEnum(CargoType)
  cargoType: CargoType

  @ApiProperty({ description: "Base rate per kilogram", minimum: 0.01 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  baseRatePerKg: number

  @ApiProperty({ description: "Distance multiplier (rate per km)", minimum: 0.0001 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  distanceMultiplier: number

  @ApiProperty({ description: "Cargo type multiplier", minimum: 0.1 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  cargoTypeMultiplier: number

  @ApiProperty({ description: "Minimum charge for this cargo type", minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumCharge: number

  @ApiPropertyOptional({ description: "Whether this configuration is active", default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class UpdatePricingConfigDto {
  @ApiPropertyOptional({ description: "Base rate per kilogram", minimum: 0.01 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  baseRatePerKg?: number

  @ApiPropertyOptional({ description: "Distance multiplier (rate per km)", minimum: 0.0001 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  distanceMultiplier?: number

  @ApiPropertyOptional({ description: "Cargo type multiplier", minimum: 0.1 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.1)
  cargoTypeMultiplier?: number

  @ApiPropertyOptional({ description: "Minimum charge for this cargo type", minimum: 0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minimumCharge?: number

  @ApiPropertyOptional({ description: "Whether this configuration is active" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}

export class PricingConfigResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty({ enum: CargoType })
  cargoType: CargoType

  @ApiProperty()
  baseRatePerKg: number

  @ApiProperty()
  distanceMultiplier: number

  @ApiProperty()
  cargoTypeMultiplier: number

  @ApiProperty()
  minimumCharge: number

  @ApiProperty()
  isActive: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
