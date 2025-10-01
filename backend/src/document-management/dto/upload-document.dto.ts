import { IsEnum, IsOptional, IsString, IsBoolean, IsNumber, IsDateString, IsUUID, IsArray, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType, DocumentPriority } from '../entities/document.entity';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'Type of document being uploaded',
    enum: DocumentType,
    example: DocumentType.BILL_OF_LADING,
  })
  @IsEnum(DocumentType)
  documentType: DocumentType;

  @ApiPropertyOptional({
    description: 'ID of the shipment this document belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @ApiPropertyOptional({
    description: 'Description of the document',
    example: 'Bill of lading for shipment #12345',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the document',
    enum: DocumentPriority,
    default: DocumentPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(DocumentPriority)
  priority?: DocumentPriority;

  @ApiPropertyOptional({
    description: 'Whether the document is confidential',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the document is required for processing',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Country of origin',
    example: 'US',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryOfOrigin?: string;

  @ApiPropertyOptional({
    description: 'Country of destination',
    example: 'CA',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryOfDestination?: string;

  @ApiPropertyOptional({
    description: 'Customs code for the document',
    example: 'HS1234567890',
  })
  @IsOptional()
  @IsString()
  customsCode?: string;

  @ApiPropertyOptional({
    description: 'Weight of the shipment in kg',
    example: 150.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Value of the shipment',
    example: 5000.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({
    description: 'Currency code for the value',
    example: 'USD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Expiry date of the document',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Tags for categorizing the document',
    example: ['urgent', 'customs', 'shipping'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata for the document',
    example: { source: 'manual_upload', department: 'logistics' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
