import { ApiProperty } from "@nestjs/swagger"
import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsObject,
  IsUrl,
  IsBoolean,
  Length,
  IsNotEmpty,
} from "class-validator"
import { LicenseType, LicenseStatus } from "../entities/license.entity"

export class CreateLicenseDto {
  @ApiProperty({ description: "License number or identifier" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  licenseNumber: string

  @ApiProperty({ enum: LicenseType, description: "Type of license" })
  @IsEnum(LicenseType)
  licenseType: LicenseType

  @ApiProperty({ description: "ID of the license holder" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  holderId: string

  @ApiProperty({ description: "Name of the license holder" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  holderName: string

  @ApiProperty({ description: "Issuing authority (state, country, etc.)" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  issuingAuthority: string

  @ApiProperty({ description: "Date when license was issued" })
  @IsDateString()
  issueDate: string

  @ApiProperty({ description: "Date when license expires" })
  @IsDateString()
  expirationDate: string

  @ApiProperty({
    enum: LicenseStatus,
    description: "Current status of the license",
    required: false,
    default: LicenseStatus.ACTIVE,
  })
  @IsEnum(LicenseStatus)
  @IsOptional()
  licenseStatus?: LicenseStatus

  @ApiProperty({
    description: "Additional license details and restrictions",
    required: false,
  })
  @IsObject()
  @IsOptional()
  licenseDetails?: Record<string, any>

  @ApiProperty({
    description: "URL or path to license document/image",
    required: false,
  })
  @IsUrl()
  @IsOptional()
  documentUrl?: string

  @ApiProperty({
    description: "Additional metadata",
    required: false,
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>

  @ApiProperty({
    description: "Whether the license is currently active",
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
