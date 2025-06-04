import { IsEnum, IsOptional, IsUUID, IsDateString } from "class-validator"
import { DocumentType, VerificationStatus } from "../entities/compliance-document.entity"

export class FilterComplianceDocumentsDto {
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType

  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus

  @IsOptional()
  @IsUUID()
  userId?: string

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string
}
