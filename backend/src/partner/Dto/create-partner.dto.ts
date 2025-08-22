import { IsNotEmpty, IsOptional, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';

export class CreatePartnerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contactInfo?: string;

  @IsArray()
  @IsOptional()
  serviceTypes?: string[];

  @IsNumber()
  @Min(0)
  @Max(5)
  @IsOptional()
  rating?: number;
}
