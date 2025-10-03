import { IsString, IsNumber, IsOptional, IsObject, ValidateNested, Min, Max } from "class-validator"
import { Type } from "class-transformer"

class FacilitiesDto {
  @IsOptional()
  hasLoadingDock?: boolean

  @IsOptional()
  hasColdStorage?: boolean

  @IsOptional()
  hasSecuritySystem?: boolean

  @IsOptional()
  @IsObject()
  operatingHours?: {
    open: string
    close: string
    timezone: string
  }
}

export class CreateWarehouseDto {
  @IsString()
  name: string

  @IsString()
  address: string

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number

  @IsNumber()
  @Min(1)
  totalCapacity: number

  @IsString()
  capacityUnit: string

  @IsOptional()
  @IsString()
  status?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => FacilitiesDto)
  facilities?: FacilitiesDto
}
