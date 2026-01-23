
import {
  IsUUID,
  IsNumber,
  IsEnum,
  IsDateString,
  IsObject,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from '../entities/tracking-event.entity';

export class CreateTrackingEventDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    minimum: -90,
    maximum: 90,
    example: 37.7749,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    minimum: -180,
    maximum: 180,
    example: -122.4194,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiProperty({
    enum: ShipmentStatus,
    description: 'Current shipment status',
    example: ShipmentStatus.IN_TRANSIT,
  })
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @ApiPropertyOptional({
    description: 'Timestamp of the tracking event',
    example: '2025-01-23T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({
    description: 'UUID of user who recorded this event',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  recordedBy: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the tracking event',
    example: { driver: 'John Doe', vehicle: 'TRUCK-001' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}