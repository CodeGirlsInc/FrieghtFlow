import { IsString, IsEmail, IsArray, IsOptional, IsBoolean, IsNumber, Min, Max, IsEnum } from 'class-validator';

export class CreateCarrierDto {
  @IsString()
  userId: string;

  @IsString()
  companyName: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  @IsOptional()
  insurancePolicy?: string;

  @IsArray()
  @IsOptional()
  serviceAreas?: string[];

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}