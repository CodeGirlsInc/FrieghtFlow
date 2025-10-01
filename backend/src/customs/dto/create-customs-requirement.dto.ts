import { IsString, IsEnum, IsBoolean, IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequirementType, RequirementStatus } from '../entities/customs-requirement.entity';

export class CreateCustomsRequirementDto {
  @ApiProperty({ description: 'Unique requirement code' })
  @IsString()
  requirementCode: string;

  @ApiProperty({ description: 'Requirement name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Requirement description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RequirementType, description: 'Type of requirement' })
  @IsEnum(RequirementType)
  type: RequirementType;

  @ApiProperty({ description: 'Origin country code (ISO 3166-1 alpha-3)' })
  @IsString()
  originCountry: string;

  @ApiProperty({ description: 'Destination country code (ISO 3166-1 alpha-3)' })
  @IsString()
  destinationCountry: string;

  @ApiPropertyOptional({ description: 'Shipment type (air, sea, road, rail)' })
  @IsOptional()
  @IsString()
  shipmentType?: string;

  @ApiPropertyOptional({ description: 'Cargo type (general, hazardous, perishable, etc.)' })
  @IsOptional()
  @IsString()
  cargoType?: string;

  @ApiPropertyOptional({ description: 'Whether this requirement is mandatory', default: true })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Whether this requirement is conditional', default: false })
  @IsOptional()
  @IsBoolean()
  isConditional?: boolean;

  @ApiPropertyOptional({ description: 'Conditions when requirement is conditional (JSON string)' })
  @IsOptional()
  @IsString()
  conditions?: string;

  @ApiPropertyOptional({ description: 'Document validity period in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  validityDays?: number;

  @ApiPropertyOptional({ description: 'Validation rules (JSON string)' })
  @IsOptional()
  @IsString()
  validationRules?: string;

  @ApiPropertyOptional({ description: 'Required document format' })
  @IsOptional()
  @IsString()
  documentFormat?: string;

  @ApiPropertyOptional({ description: 'Minimum shipment value for this requirement' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minValue?: number;

  @ApiPropertyOptional({ description: 'Maximum shipment value for this requirement' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxValue?: number;

  @ApiPropertyOptional({ enum: RequirementStatus, description: 'Requirement status', default: RequirementStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RequirementStatus)
  status?: RequirementStatus;

  @ApiPropertyOptional({ description: 'Customs authority that enforces this requirement' })
  @IsOptional()
  @IsString()
  authority?: string;

  @ApiPropertyOptional({ description: 'Link to official documentation' })
  @IsOptional()
  @IsString()
  referenceUrl?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
