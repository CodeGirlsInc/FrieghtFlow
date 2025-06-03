import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  MinLength,
  IsDateString,
  IsDecimal,
  IsBoolean,
} from "class-validator"
import { VehicleType } from "../entities/shipper.entity"

export class CreateShipperDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  password: string

  @IsString()
  firstName: string

  @IsString()
  lastName: string

  @IsPhoneNumber()
  phoneNumber: string

  @IsOptional()
  @IsString()
  profileImage?: string

  @IsOptional()
  @IsString()
  licenseNumber?: string

  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string

  @IsOptional()
  @IsString()
  insuranceNumber?: string

  @IsOptional()
  @IsDateString()
  insuranceExpiryDate?: string

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType

  @IsOptional()
  @IsString()
  vehicleModel?: string

  @IsOptional()
  @IsString()
  vehiclePlateNumber?: string

  @IsString()
  address: string

  @IsString()
  city: string

  @IsString()
  state: string

  @IsString()
  zipCode: string

  @IsString()
  country: string

  @IsOptional()
  @IsDecimal()
  latitude?: number

  @IsOptional()
  @IsDecimal()
  longitude?: number

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean
}
