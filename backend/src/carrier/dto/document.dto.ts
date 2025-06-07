import { IsString, IsEnum, IsOptional, IsDateString } from "class-validator"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { DocumentType, DocumentStatus } from "../entities/carrier-document.entity"

export class UploadDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentNumber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issueDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  issuingAuthority?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string
}

export class UpdateDocumentStatusDto {
  @ApiProperty({ enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  status: DocumentStatus

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string
}
