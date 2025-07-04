import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsInt, Min, Max } from "class-validator"
import { Transform } from "class-transformer"
import { LicenseType, LicenseStatus, ValidationStatus } from "../entities/license.entity"

export class QueryLicensesDto {
  @ApiProperty({ description: "License number to search for", required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string

  @ApiProperty({ enum: LicenseType, description: "Filter by license type", required: false })
  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType

  @ApiProperty({ description: "Filter by holder ID", required: false })
  @IsOptional()
  @IsString()
  holderId?: string

  @ApiProperty({ description: "Filter by holder name", required: false })
  @IsOptional()
  @IsString()
  holderName?: string

  @ApiProperty({ description: "Filter by issuing authority", required: false })
  @IsOptional()
  @IsString()
  issuingAuthority?: string

  @ApiProperty({ enum: LicenseStatus, description: "Filter by license status", required: false })
  @IsOptional()
  @IsEnum(LicenseStatus)
  licenseStatus?: LicenseStatus

  @ApiProperty({ enum: ValidationStatus, description: "Filter by validation status", required: false })
  @IsOptional()
  @IsEnum(ValidationStatus)
  validationStatus?: ValidationStatus

  @ApiProperty({ description: "Filter by expiration date from", required: false })
  @IsOptional()
  @IsDateString()
  expirationDateFrom?: string

  @ApiProperty({ description: "Filter by expiration date to", required: false })
  @IsOptional()
  @IsDateString()
  expirationDateTo?: string

  @ApiProperty({ description: "Filter by creation date from", required: false })
  @IsOptional()
  @IsDateString()
  createdFrom?: string

  @ApiProperty({ description: "Filter by creation date to", required: false })
  @IsOptional()
  @IsDateString()
  createdTo?: string

  @ApiProperty({ description: "Filter by active status", required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  isActive?: boolean

  @ApiProperty({ description: "Show only expired licenses", required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === "true")
  expiredOnly?: boolean

  @ApiProperty({ description: "Show only licenses expiring soon (within days)", required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  @Transform(({ value }) => Number.parseInt(value))
  expiringSoonDays?: number

  @ApiProperty({ description: "Number of records to return", required: false, default: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @Transform(({ value }) => Number.parseInt(value))
  limit?: number = 50

  @ApiProperty({ description: "Number of records to skip", required: false, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number.parseInt(value))
  offset?: number = 0

  @ApiProperty({
    description: "Sort order",
    required: false,
    enum: ["ASC", "DESC"],
    default: "DESC",
  })
  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC" = "DESC"

  @ApiProperty({
    description: "Sort by field",
    required: false,
    enum: ["createdAt", "expirationDate", "lastValidatedAt", "licenseNumber"],
    default: "createdAt",
  })
  @IsOptional()
  @IsEnum(["createdAt", "expirationDate", "lastValidatedAt", "licenseNumber"])
  sortBy?: string = "createdAt"
}
