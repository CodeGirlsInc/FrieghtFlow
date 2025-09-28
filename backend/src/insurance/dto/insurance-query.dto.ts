import { IsOptional, IsString, IsEnum, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CoverageType, PolicyStatus } from '../entities/insurance-policy.entity';
import { ClaimStatus, ClaimType } from '../entities/claim-history.entity';

export class InsurancePolicyQueryDto {
  @ApiPropertyOptional({ description: 'Filter by policy number' })
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by provider' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ enum: CoverageType, description: 'Filter by coverage type' })
  @IsOptional()
  @IsEnum(CoverageType)
  coverageType?: CoverageType;

  @ApiPropertyOptional({ enum: PolicyStatus, description: 'Filter by policy status' })
  @IsOptional()
  @IsEnum(PolicyStatus)
  status?: PolicyStatus;

  @ApiPropertyOptional({ description: 'Filter by shipment ID' })
  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @ApiPropertyOptional({ description: 'Filter by effective date from' })
  @IsOptional()
  @IsDateString()
  effectiveDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by effective date to' })
  @IsOptional()
  @IsDateString()
  effectiveDateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by expiry date from' })
  @IsOptional()
  @IsDateString()
  expiryDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by expiry date to' })
  @IsOptional()
  @IsDateString()
  expiryDateTo?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class ClaimQueryDto {
  @ApiPropertyOptional({ description: 'Filter by claim number' })
  @IsOptional()
  @IsString()
  claimNumber?: string;

  @ApiPropertyOptional({ enum: ClaimType, description: 'Filter by claim type' })
  @IsOptional()
  @IsEnum(ClaimType)
  claimType?: ClaimType;

  @ApiPropertyOptional({ enum: ClaimStatus, description: 'Filter by claim status' })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiPropertyOptional({ description: 'Filter by insurance policy ID' })
  @IsOptional()
  @IsUUID()
  insurancePolicyId?: string;

  @ApiPropertyOptional({ description: 'Filter by incident date from' })
  @IsOptional()
  @IsDateString()
  incidentDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by incident date to' })
  @IsOptional()
  @IsDateString()
  incidentDateTo?: string;

  @ApiPropertyOptional({ description: 'Filter by claim date from' })
  @IsOptional()
  @IsDateString()
  claimDateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter by claim date to' })
  @IsOptional()
  @IsDateString()
  claimDateTo?: string;

  @ApiPropertyOptional({ description: 'Page number', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
