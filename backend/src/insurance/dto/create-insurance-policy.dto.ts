import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, IsUUID, IsEmail, IsPhoneNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CoverageType, PolicyStatus } from '../entities/insurance-policy.entity';

export class CreateInsurancePolicyDto {
  @ApiProperty({ description: 'Unique policy number' })
  @IsString()
  policyNumber: string;

  @ApiProperty({ description: 'Insurance provider name' })
  @IsString()
  provider: string;

  @ApiProperty({ enum: CoverageType, description: 'Type of coverage' })
  @IsEnum(CoverageType)
  coverageType: CoverageType;

  @ApiProperty({ description: 'Coverage amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  coverageAmount: number;

  @ApiProperty({ description: 'Premium amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  premiumAmount: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Deductible amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductible?: number;

  @ApiProperty({ description: 'Policy effective date' })
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({ description: 'Policy expiry date' })
  @IsDateString()
  expiryDate: string;

  @ApiPropertyOptional({ enum: PolicyStatus, description: 'Policy status', default: PolicyStatus.PENDING })
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: PolicyStatus;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiPropertyOptional({ description: 'Policy exclusions' })
  @IsOptional()
  @IsString()
  exclusions?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Contact person name' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone number' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: 'Associated shipment ID' })
  @IsUUID()
  shipmentId: string;
}
