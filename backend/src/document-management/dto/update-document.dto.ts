import { IsEnum, IsOptional, IsString, IsBoolean, IsDateString, IsArray, MaxLength, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentStatus, DocumentPriority } from '../entities/document.entity';

export class UpdateDocumentDto {
  @ApiPropertyOptional({
    description: 'Update document status',
    enum: DocumentStatus,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Update document priority',
    enum: DocumentPriority,
  })
  @IsOptional()
  @IsEnum(DocumentPriority)
  priority?: DocumentPriority;

  @ApiPropertyOptional({
    description: 'Update document description',
    example: 'Updated bill of lading for shipment #12345',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Update confidentiality status',
  })
  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @ApiPropertyOptional({
    description: 'Update required status',
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Update country of origin',
    example: 'US',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryOfOrigin?: string;

  @ApiPropertyOptional({
    description: 'Update country of destination',
    example: 'CA',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  countryOfDestination?: string;

  @ApiPropertyOptional({
    description: 'Update customs code',
    example: 'HS1234567890',
  })
  @IsOptional()
  @IsString()
  customsCode?: string;

  @ApiPropertyOptional({
    description: 'Update weight of the shipment in kg',
    example: 150.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({
    description: 'Update value of the shipment',
    example: 5000.00,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({
    description: 'Update currency code for the value',
    example: 'USD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Update expiry date of the document',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Update tags for categorizing the document',
    example: ['urgent', 'customs', 'shipping'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Reason for rejection (if status is REJECTED)',
    example: 'Document is not legible',
  })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the document',
    example: { source: 'manual_upload', department: 'logistics' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}
