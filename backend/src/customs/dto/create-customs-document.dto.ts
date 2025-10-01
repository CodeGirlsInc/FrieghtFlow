// dto/create-customs-document.dto.ts
import { IsString, IsEnum, IsOptional, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentStatus } from '../entities/customs-document.entity';

export class CreateCustomsDocumentDto {
  @ApiProperty({ description: 'Associated shipment ID' })
  @IsUUID()
  shipmentId: string;

  @ApiPropertyOptional({ description: 'Associated requirement ID' })
  @IsOptional()
  @IsUUID()
  requirementId?: string;

  @ApiProperty({ enum: DocumentType, description: 'Type of document' })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiProperty({ description: 'Original file name' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'File URL or path' })
  @IsString()
  fileUrl: string;

  @ApiPropertyOptional({ description: 'File size' })
  @IsOptional()
  @IsString()
  fileSize?: string;

  @ApiPropertyOptional({ description: 'MIME type of the file' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ enum: DocumentStatus, description: 'Document status', default: DocumentStatus.PENDING })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ description: 'Document expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Uploaded by user' })
  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (JSON string)' })
  @IsOptional()
  @IsString()
  metadata?: string;
}
