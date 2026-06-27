import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaginationDto } from '../../../src/package/pagination/dto/pagination.dto';

export class CarrierSearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsString()
  vehicleType?: string;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsIn(['rating', 'completedShipments'])
  sortBy?: 'rating' | 'completedShipments';
}
