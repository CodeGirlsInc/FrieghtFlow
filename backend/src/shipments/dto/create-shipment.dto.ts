import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  IsISO4217CurrencyCode,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShipmentDto {
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

  @ApiProperty({ example: 500.5, description: 'Weight in kilograms' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  weightKg: number;

  @ApiPropertyOptional({ example: 2.5, description: 'Volume in cubic metres' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  volumeCbm?: number;

  @ApiProperty({
    example: 1500.0,
    description: 'Quoted price for the shipment',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  price: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @IsISO4217CurrencyCode()
  currency?: string;

  @ApiPropertyOptional({ example: 'Handle with care — fragile electronics' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({ example: '2025-03-01T08:00:00Z' })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({ example: '2025-03-05T18:00:00Z' })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;
}
