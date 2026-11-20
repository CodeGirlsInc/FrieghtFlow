import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Body for `POST /shipments/eta/estimate`.
 *
 * `origin` / `destination` are free-form location strings ("Lagos,
 * Nigeria", "US", "Frankfurt DE"); the service resolves each to a
 * shipping zone and rejects anything it cannot place rather than
 * defaulting to a zone.
 */
export class EstimateEtaDto {
  @ApiProperty({ example: 'Lagos, Nigeria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  origin: string;

  @ApiProperty({ example: 'Abuja, Nigeria' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  destination: string;

  @ApiProperty({ example: 120, description: 'Weight in kilograms' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  weightKg: number;
}
