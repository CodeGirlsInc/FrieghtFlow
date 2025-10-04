import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCarrierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  licenseNumber?: string;
}