import { IsEnum, IsString, IsOptional } from "class-validator"
import { VerificationStatus } from "../entities/compliance-document.entity"

export class VerifyDocumentDto {
  @IsEnum(VerificationStatus)
  status: VerificationStatus

  @IsOptional()
  @IsString()
  rejectionReason?: string

  @IsOptional()
  @IsString()
  notes?: string
}
