import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClaimType, ClaimStatus } from '../entities/claim-history.entity';

export class CreateClaimDto {
  @ApiProperty({ description: 'Unique claim number' })
  @IsString()
  claimNumber: string;

  @ApiProperty({ enum: ClaimType, description: 'Type of claim' })
  @IsEnum(ClaimType)
  claimType: ClaimType;

  @ApiPropertyOptional({ enum: ClaimStatus, description: 'Claim status', default: ClaimStatus.SUBMITTED })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiProperty({ description: 'Claimed amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  claimedAmount: number;

  @ApiPropertyOptional({ description: 'Approved amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvedAmount?: number;

  @ApiPropertyOptional({ description: 'Paid amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Date of incident' })
  @IsDateString()
  incidentDate: string;

  @ApiProperty({ description: 'Date claim was filed' })
  @IsDateString()
  claimDate: string;

  @ApiPropertyOptional({ description: 'Settlement date' })
  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @ApiProperty({ description: 'Detailed description of the claim' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Investigation notes' })
  @IsOptional()
  @IsString()
  investigationNotes?: string;

  @ApiPropertyOptional({ description: 'Supporting documents (JSON string of URLs/paths)' })
  @IsOptional()
  @IsString()
  supportingDocuments?: string;

  @ApiPropertyOptional({ description: 'Adjuster notes' })
  @IsOptional()
  @IsString()
  adjusterNotes?: string;

  @ApiPropertyOptional({ description: 'Adjuster name' })
  @IsOptional()
  @IsString()
  adjusterName?: string;

  @ApiPropertyOptional({ description: 'Adjuster contact information' })
  @IsOptional()
  @IsString()
  adjusterContact?: string;

  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({ description: 'Settlement notes' })
  @IsOptional()
  @IsString()
  settlementNotes?: string;

  @ApiProperty({ description: 'Associated insurance policy ID' })
  @IsUUID()
  insurancePolicyId: string;
}
