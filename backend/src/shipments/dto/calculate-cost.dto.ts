import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CargoCategory } from '../../common/enums/cargo-category.enum';

export class CalculateCostDto {
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

  @ApiProperty({ example: 500.5, description: 'Weight in kilograms' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  weight: number;

  @ApiPropertyOptional({
    enum: CargoCategory,
    example: CargoCategory.ELECTRONICS,
  })
  @IsOptional()
  @IsEnum(CargoCategory)
  cargoCategory?: CargoCategory;
}
