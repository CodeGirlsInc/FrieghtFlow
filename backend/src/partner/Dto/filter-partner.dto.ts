import { IsOptional, IsString, IsNumber } from 'class-validator';

export class FilterPartnerDto {
  @IsOptional()
  @IsString()
  serviceType?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
