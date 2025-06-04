import { IsEnum, IsString, IsOptional, IsDateString, IsUUID } from "class-validator"
import { DocumentType } from "../entities/compliance-document.entity"

export class CreateComplianceDocumentDto {
  @IsEnum(DocumentType)
  documentType: DocumentType

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string

  @IsString()
  fileUrl: string

  @IsOptional()
  @IsString()
  fileType?: string

  @IsOptional()
  fileSize?: number

  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @IsUUID()
  userId: string
}
