import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Body for `POST /shipments/templates`.
 *
 * Ownership is never accepted from the client — the controller always
 * stamps `userId` from the authenticated user.
 */
export class CreateShipmentTemplateDto {
  @ApiProperty({ example: 'Weekly Lagos route' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

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

  @ApiProperty({ example: 'Electronics — 200 units of laptop computers' })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(2000)
  cargoDescription: string;

  // Upper bounds mirror the `NUMERIC(10,2)` / `NUMERIC(14,2)` columns on
  // `shipment_templates`, so a value the database cannot store is rejected at
  // the edge with a 400 instead of failing later as a driver-level overflow.
  @ApiProperty({
    example: 100,
    description: 'Weight in kilograms (max 99999999.99)',
    maximum: 99_999_999.99,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(99_999_999.99)
  weightKg: number;

  @ApiProperty({
    example: 5000,
    description: 'Quoted price for the shipment (max 999999999999.99)',
    maximum: 999_999_999_999.99,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(999_999_999_999.99)
  price: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @IsISO4217CurrencyCode()
  currency?: string;
}
