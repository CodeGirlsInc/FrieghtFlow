import { IsEnum, IsOptional, IsString, IsUUID, IsNumber, IsDateString, IsBoolean, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { DocumentType, DocumentStatus, DocumentPriority } from '../entities/document.entity';

export class QueryDocumentsDto {
  @ApiPropertyOptional({
    description: 'Filter by document type',
    enum: DocumentType,
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({
    description: 'Filter by document status',
    enum: DocumentStatus,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({
    description: 'Filter by document priority',
    enum: DocumentPriority,
  })
  @IsOptional()
  @IsEnum(DocumentPriority)
  priority?: DocumentPriority;

  @ApiPropertyOptional({
    description: 'Filter by shipment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by uploader user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  uploadedBy?: string;

  @ApiPropertyOptional({
    description: 'Filter by country of origin',
    example: 'US',
  })
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @ApiPropertyOptional({
    description: 'Filter by country of destination',
    example: 'CA',
  })
  @IsOptional()
  @IsString()
  countryOfDestination?: string;

  @ApiPropertyOptional({
    description: 'Filter by customs code',
    example: 'HS1234567890',
  })
  @IsOptional()
  @IsString()
  customsCode?: string;

  @ApiPropertyOptional({
    description: 'Filter by confidential documents only',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isConfidential?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by required documents only',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by tags',
    example: ['urgent', 'customs'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Filter documents created after this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter documents created before this date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter documents expiring after this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter documents expiring before this date',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  expiresBefore?: string;

  @ApiPropertyOptional({
    description: 'Search in document names and descriptions',
    example: 'invoice',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Number of documents to return',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Number of documents to skip',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'fileName', 'fileSize', 'expiryDate', 'priority'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
