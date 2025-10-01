import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsObject, IsArray, Min, Max, MaxLength, IsEmail, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarrierType, CarrierStatus } from '../entities/carrier.entity';

export class CreateCarrierDto {
  @ApiProperty({ description: 'Carrier name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Carrier description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: CarrierType, description: 'Type of carrier' })
  @IsEnum(CarrierType)
  carrierType: CarrierType;

  @ApiPropertyOptional({ enum: CarrierStatus, description: 'Carrier status', default: CarrierStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CarrierStatus)
  status?: CarrierStatus;

  @ApiPropertyOptional({ description: 'Carrier website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone number', maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Headquarters location', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  headquarters?: string;

  @ApiPropertyOptional({ description: 'Service areas (array of location codes)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceAreas?: string[];

  @ApiPropertyOptional({ description: 'Carrier capabilities' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Carrier certifications' })
  @IsOptional()
  @IsObject()
  certifications?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Reliability score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reliabilityScore?: number;

  @ApiPropertyOptional({ description: 'Safety score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  safetyScore?: number;

  @ApiPropertyOptional({ description: 'Cost score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  costScore?: number;

  @ApiPropertyOptional({ description: 'Speed score (0-100)', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  speedScore?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether the carrier is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
