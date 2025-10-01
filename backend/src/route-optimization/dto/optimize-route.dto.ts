import { IsString, IsEnum, IsNumber, IsOptional, IsObject, IsArray, Min, Max, MaxLength, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OptimizationCriteria } from '../entities/route-optimization-request.entity';

export class OptimizeRouteDto {
  @ApiProperty({ description: 'Origin location' })
  @IsString()
  @MaxLength(255)
  origin: string;

  @ApiProperty({ description: 'Destination location' })
  @IsString()
  @MaxLength(255)
  destination: string;

  @ApiProperty({ enum: OptimizationCriteria, description: 'Optimization criteria' })
  @IsEnum(OptimizationCriteria)
  criteria: OptimizationCriteria;

  @ApiPropertyOptional({ description: 'Cargo weight in kg', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Cargo volume in cubic meters', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ description: 'Type of cargo' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cargoType?: string;

  @ApiPropertyOptional({ description: 'Route constraints' })
  @IsOptional()
  @IsObject()
  constraints?: Record<string, any>;

  @ApiPropertyOptional({ description: 'User preferences' })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Preferred carriers (array of carrier IDs)' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  preferredCarriers?: string[];

  @ApiPropertyOptional({ description: 'Maximum cost limit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCost?: number;

  @ApiPropertyOptional({ description: 'Maximum duration in hours' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDuration?: number;

  @ApiPropertyOptional({ description: 'Maximum distance in km' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDistance?: number;

  @ApiPropertyOptional({ description: 'Minimum reliability score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minReliabilityScore?: number;

  @ApiPropertyOptional({ description: 'Minimum safety score (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  minSafetyScore?: number;

  @ApiPropertyOptional({ description: 'Maximum carbon footprint in kg CO2' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCarbonFootprint?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
