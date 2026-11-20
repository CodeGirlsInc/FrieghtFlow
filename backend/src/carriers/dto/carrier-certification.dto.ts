import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsDefined,
  IsEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CertificationType } from '../entities/carrier-certification.entity';
import { IsFutureDate } from '../../common/validators/is-future-date.decorator';

export class CreateCarrierCertificationDto {
  @ApiProperty({ enum: CertificationType })
  @IsEnum(CertificationType)
  documentType: CertificationType;

  @ApiProperty({
    description:
      'ID returned by the platform certification-document upload endpoint',
    example: '4c5e6f70-8b9a-4c1d-9e2f-1234567890ab',
  })
  @IsDefined()
  @IsUUID()
  documentId: string;

  /**
   * @deprecated External URLs are not a valid certification reference. Keep a
   * tombstone validator so old clients receive a useful validation error
   * instead of silently falling back to an unowned file.
   */
  @IsOptional()
  @IsEmpty({ message: 'fileUrl is not accepted; use documentId instead' })
  fileUrl?: string | null;

  @ApiProperty({ example: 'Federal Motor Carrier Safety Administration' })
  @IsString()
  @IsNotEmpty()
  issuedBy: string;

  @ApiPropertyOptional({ example: '2027-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  @IsFutureDate()
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
