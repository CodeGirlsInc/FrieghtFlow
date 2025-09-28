import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationType, VerificationStatus } from '../entities/document-verification.entity';

export class CreateVerificationDto {
  @ApiProperty({
    description: 'Type of verification to perform',
    enum: VerificationType,
    example: VerificationType.AUTOMATIC,
  })
  @IsEnum(VerificationType)
  verificationType: VerificationType;

  @ApiPropertyOptional({
    description: 'Notes for the verification process',
    example: 'Manual review required due to document quality',
  })
  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @ApiPropertyOptional({
    description: 'Additional data for verification',
    example: { ocrEnabled: true, signatureCheck: true },
  })
  @IsOptional()
  verificationData?: Record<string, any>;
}

export class UpdateVerificationDto {
  @ApiPropertyOptional({
    description: 'Update verification status',
    enum: VerificationStatus,
  })
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @ApiPropertyOptional({
    description: 'Confidence score for the verification (0-100)',
    example: 85.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore?: number;

  @ApiPropertyOptional({
    description: 'Notes from the verification process',
    example: 'Document verified successfully with high confidence',
  })
  @IsOptional()
  @IsString()
  verificationNotes?: string;

  @ApiPropertyOptional({
    description: 'Error message if verification failed',
    example: 'OCR could not extract text from document',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'OCR extracted text from the document',
    example: 'BILL OF LADING\nShipper: ABC Company...',
  })
  @IsOptional()
  @IsString()
  ocrText?: string;

  @ApiPropertyOptional({
    description: 'Extracted structured data from the document',
    example: { shipper: 'ABC Company', consignee: 'XYZ Corp', weight: '150kg' },
  })
  @IsOptional()
  extractedData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Whether the signature is valid',
  })
  @IsOptional()
  @IsBoolean()
  signatureValid?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the document integrity is intact',
  })
  @IsOptional()
  @IsBoolean()
  documentIntegrity?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the document passes compliance checks',
  })
  @IsOptional()
  @IsBoolean()
  complianceCheck?: boolean;

  @ApiPropertyOptional({
    description: 'Processing time in milliseconds',
    example: 2500,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  processingTime?: number;
}
