import { PartialType } from "@nestjs/mapped-types"
import { CreateComplianceDocumentDto } from "./create-compliance-document.dto"
import { IsEnum, IsOptional, IsString, IsDateString } from "class-validator"
import { VerificationStatus } from "../entities/compliance-document.entity"

export class UpdateComplianceDocumentDto extends PartialType(CreateComplianceDocumentDto) {
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus

  @IsOptional()
  @IsString()
  rejectionReason?: string

  @IsOptional()
  @IsString()
  notes?: string

  @IsOptional()
  @IsDateString()
  expiryDate?: string
}
