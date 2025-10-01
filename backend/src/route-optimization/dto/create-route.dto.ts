import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, IsObject, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RouteType, RouteStatus, OptimizationAlgorithm } from '../entities/route.entity';

export class CreateRouteDto {
  @ApiProperty({ description: 'Route name', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Route description', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Origin location' })
  @IsString()
  @MaxLength(255)
  origin: string;

  @ApiProperty({ description: 'Destination location' })
  @IsString()
  @MaxLength(255)
  destination: string;

  @ApiProperty({ enum: RouteType, description: 'Type of route' })
  @IsEnum(RouteType)
  routeType: RouteType;

  @ApiPropertyOptional({ enum: RouteStatus, description: 'Route status', default: RouteStatus.ACTIVE })
  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;

  @ApiProperty({ description: 'Total distance in kilometers', minimum: 0 })
  @IsNumber()
  @Min(0)
  totalDistance: number;

  @ApiProperty({ description: 'Estimated duration in hours', minimum: 0 })
  @IsNumber()
  @Min(0)
  estimatedDuration: number;

  @ApiProperty({ description: 'Base cost', minimum: 0 })
  @IsNumber()
  @Min(0)
  baseCost: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD', maxLength: 3 })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Carbon footprint in kg CO2', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbonFootprint?: number;

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

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Route restrictions' })
  @IsOptional()
  @IsObject()
  restrictions?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Route capabilities' })
  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;

  @ApiPropertyOptional({ enum: OptimizationAlgorithm, description: 'Optimization algorithm to use' })
  @IsOptional()
  @IsEnum(OptimizationAlgorithm)
  optimizationAlgorithm?: OptimizationAlgorithm;

  @ApiPropertyOptional({ description: 'Whether the route is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
