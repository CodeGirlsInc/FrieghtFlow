// dto/create-compliance-check.dto.ts
import { IsString, IsEnum, IsOptional, IsUUID, IsBoolean, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CheckType, CheckStatus, CheckPriority } from '../entities/compliance-check.entity';

export class CreateComplianceCheckDto {
  @ApiProperty({ description: 'Associated shipment ID' })
  @IsUUID()
  shipmentId: string;

  @ApiPropertyOptional({ description: 'Associated requirement ID' })
  @IsOptional()
  @IsUUID()
  requirementId?: string;

  @ApiProperty({ enum: CheckType, description: 'Type of compliance check' })
  @IsEnum(CheckType)
  checkType: CheckType;

  @ApiProperty({ description: 'Name of the check' })
  @IsString()
  checkName: string;

  @ApiPropertyOptional({ description: 'Check description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: CheckStatus, description: 'Check status', default: CheckStatus.PENDING })
  @IsOptional()
  @IsEnum(CheckStatus)
  status?: CheckStatus;

  @ApiPropertyOptional({ enum: CheckPriority, description: 'Check priority', default: CheckPriority.MEDIUM })
  @IsOptional()
  @IsEnum(CheckPriority)
  priority?: CheckPriority;

  @ApiPropertyOptional({ description: 'Whether this check is automated', default: false })
  @IsOptional()
  @IsBoolean()
  isAutomated?: boolean;

  @ApiPropertyOptional({ description: 'Whether this check is mandatory', default: true })
  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;

  @ApiPropertyOptional({ description: 'Validation rules (JSON string)' })
  @IsOptional()
  @IsString()
  validationRules?: string;

  @ApiPropertyOptional({ description: 'Check notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Performed by user' })
  @IsOptional()
  @IsString()
  performedBy?: string;

  @ApiPropertyOptional({ description: 'Scheduled execution time' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ description: 'Maximum number of retries' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRetries?: number;
}
