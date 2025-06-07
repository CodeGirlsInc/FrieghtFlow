import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from "class-validator"
import { Transform } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { CarrierType, CarrierStatus } from "../entities/carrier.entity"

export class CreateCarrierDto {
  @ApiProperty()
  @IsString()
  companyName: string

  @ApiProperty()
  @IsString()
  contactPerson: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsPhoneNumber()
  phone: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  alternatePhone?: string

  @ApiProperty()
  @IsString()
  address: string

  @ApiProperty()
  @IsString()
  city: string

  @ApiProperty()
  @IsString()
  state: string

  @ApiProperty()
  @IsString()
  zipCode: string

  @ApiProperty()
  @IsString()
  country: string

  @ApiProperty()
  @IsString()
  licenseNumber: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxId?: string

  @ApiProperty({ enum: CarrierType })
  @IsEnum(CarrierType)
  carrierType: CarrierType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, any>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  bankDetails?: {
    accountName: string
    accountNumber: string
    bankName: string
    routingNumber: string
    swiftCode?: string
  }
}

export class UpdateCarrierDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPerson?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsPhoneNumber()
  alternatePhone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zipCode?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  operatingHours?: Record<string, any>

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  bankDetails?: Record<string, any>
}

export class UpdateCarrierStatusDto {
  @ApiProperty({ enum: CarrierStatus })
  @IsEnum(CarrierStatus)
  status: CarrierStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string
}

export class CarrierQueryDto {
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

  @ApiPropertyOptional({ enum: CarrierStatus })
  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus

  @ApiPropertyOptional({ enum: CarrierType })
  @IsOptional()
  @IsEnum(CarrierType)
  carrierType?: CarrierType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === "true")
  @IsBoolean()
  isActive?: boolean
}
