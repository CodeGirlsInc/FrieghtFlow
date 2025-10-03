import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RouteOptimizationResultDto {
  @ApiProperty({ description: 'Optimized route ID' })
  routeId: string;

  @ApiProperty({ description: 'Route name' })
  routeName: string;

  @ApiProperty({ description: 'Origin location' })
  origin: string;

  @ApiProperty({ description: 'Destination location' })
  destination: string;

  @ApiProperty({ description: 'Total optimized cost' })
  optimizedCost: number;

  @ApiProperty({ description: 'Total optimized distance in km' })
  optimizedDistance: number;

  @ApiProperty({ description: 'Total optimized duration in hours' })
  optimizedDuration: number;

  @ApiProperty({ description: 'Carbon footprint in kg CO2' })
  carbonFootprint: number;

  @ApiProperty({ description: 'Reliability score (0-100)' })
  reliabilityScore: number;

  @ApiProperty({ description: 'Safety score (0-100)' })
  safetyScore: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Route segments' })
  segments: RouteSegmentResultDto[];

  @ApiPropertyOptional({ description: 'Alternative routes' })
  alternatives?: RouteOptimizationResultDto[];

  @ApiPropertyOptional({ description: 'Optimization metadata' })
  metadata?: Record<string, any>;
}

export class RouteSegmentResultDto {
  @ApiProperty({ description: 'Segment ID' })
  segmentId: string;

  @ApiProperty({ description: 'Segment type' })
  segmentType: string;

  @ApiProperty({ description: 'Origin location' })
  origin: string;

  @ApiProperty({ description: 'Destination location' })
  destination: string;

  @ApiProperty({ description: 'Distance in km' })
  distance: number;

  @ApiProperty({ description: 'Duration in hours' })
  duration: number;

  @ApiProperty({ description: 'Cost' })
  cost: number;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Carbon footprint in kg CO2' })
  carbonFootprint: number;

  @ApiProperty({ description: 'Reliability score (0-100)' })
  reliabilityScore: number;

  @ApiProperty({ description: 'Safety score (0-100)' })
  safetyScore: number;

  @ApiProperty({ description: 'Carrier information' })
  carrier?: CarrierResultDto;
}

export class CarrierResultDto {
  @ApiProperty({ description: 'Carrier ID' })
  id: string;

  @ApiProperty({ description: 'Carrier name' })
  name: string;

  @ApiProperty({ description: 'Carrier type' })
  type: string;

  @ApiProperty({ description: 'Reliability score (0-100)' })
  reliabilityScore: number;

  @ApiProperty({ description: 'Safety score (0-100)' })
  safetyScore: number;

  @ApiProperty({ description: 'Cost score (0-100)' })
  costScore: number;

  @ApiProperty({ description: 'Speed score (0-100)' })
  speedScore: number;
}
