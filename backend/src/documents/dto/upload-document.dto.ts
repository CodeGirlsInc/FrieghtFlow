import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../enums/document-type.enum';

export class UploadDocumentDto {
  @ApiProperty({ description: 'UUID of the shipment this document belongs to' })
  @IsUUID()
  shipmentId: string;

  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiPropertyOptional({ description: 'Optional notes about this document' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
