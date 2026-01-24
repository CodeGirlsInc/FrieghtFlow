import { IsString, IsUUID, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsString()
  carrierId: string;

  @IsString()
  ratedBy: string;

  @IsString()
  @IsOptional()
  freightJobId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  review?: string;
}