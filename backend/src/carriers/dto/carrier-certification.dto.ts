import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificationType } from '../entities/carrier-certification.entity';

export class CreateCarrierCertificationDto {
  @ApiProperty({ enum: CertificationType })
  @IsEnum(CertificationType)
  documentType: CertificationType;

  @ApiProperty({ example: 'https://storage.example.com/certs/license.pdf' })
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ example: 'Federal Motor Carrier Safety Administration' })
  @IsString()
  @IsNotEmpty()
  issuedBy: string;

  @ApiPropertyOptional({ example: '2027-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: 'Valid for interstate commerce' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCertificationVerificationDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isVerified: boolean;

  @ApiPropertyOptional({ example: 'Verified by admin review' })
  @IsOptional()
  @IsString()
  notes?: string;
}
