import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CargoCategory } from '../../common/enums/cargo-category.enum';

export class SearchMarketplaceDto {
  @ApiPropertyOptional() @IsString() @IsOptional() origin?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() destination?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Type(() => Number) minPrice?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Type(() => Number) maxPrice?: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() @Type(() => Number) maxWeightKg?: number;
  @ApiPropertyOptional({ enum: CargoCategory }) @IsEnum(CargoCategory) @IsOptional() cargoCategory?: CargoCategory;
  @ApiPropertyOptional() @IsInt() @IsOptional() @Type(() => Number) postedWithinHours?: number;
  @ApiPropertyOptional({ default: 1 }) @IsInt() @Min(1) @IsOptional() @Type(() => Number) page?: number = 1;
  @ApiPropertyOptional({ default: 20 }) @IsInt() @Min(1) @Max(100) @IsOptional() @Type(() => Number) limit?: number = 20;
  @ApiPropertyOptional({ enum: ['price', 'weight', 'postedAt'] }) @IsString() @IsOptional() sortBy?: string;
}
