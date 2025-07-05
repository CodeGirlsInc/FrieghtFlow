import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsEnum, IsOptional, IsObject, IsBoolean, Length, IsNotEmpty } from "class-validator"
import { LicenseType } from "../entities/license.entity"
import { ValidationMethod } from "../entities/license-validation.entity"

export class ValidateLicenseDto {
  @ApiProperty({ description: "License number to validate" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  licenseNumber: string

  @ApiProperty({ enum: LicenseType, description: "Type of license" })
  @IsEnum(LicenseType)
  licenseType: LicenseType

  @ApiProperty({ description: "Issuing authority for validation context" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  issuingAuthority: string

  @ApiProperty({
    enum: ValidationMethod,
    description: "Preferred validation method",
    required: false,
    default: ValidationMethod.THIRD_PARTY_API,
  })
  @IsEnum(ValidationMethod)
  @IsOptional()
  validationMethod?: ValidationMethod

  @ApiProperty({
    description: "Additional validation parameters",
    required: false,
  })
  @IsObject()
  @IsOptional()
  validationParams?: Record<string, any>

  @ApiProperty({
    description: "Force revalidation even if recently validated",
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  forceRevalidation?: boolean

  @ApiProperty({
    description: "User or system initiating validation",
    required: false,
  })
  @IsString()
  @IsOptional()
  validatedBy?: string
}

export class BulkValidateLicensesDto {
  @ApiProperty({
    description: "Array of license validation requests",
    type: [ValidateLicenseDto],
  })
  licenses: ValidateLicenseDto[]

  @ApiProperty({
    description: "User or system initiating bulk validation",
    required: false,
  })
  @IsString()
  @IsOptional()
  validatedBy?: string
}
