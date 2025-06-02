import { IsOptional, IsString, IsBoolean, IsIn, IsArray, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { DocumentDto } from "./create-verification.dto"

export class UpdateVerificationDto {
  @IsOptional()
  @IsString()
  @IsIn(["pending", "verified", "rejected"])
  status?: "pending" | "verified" | "rejected"

  @IsOptional()
  @IsString()
  verifiedBy?: string

  @IsOptional()
  @IsString()
  rejectionReason?: string

  @IsOptional()
  @IsBoolean()
  isCompliant?: boolean

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[]
}
