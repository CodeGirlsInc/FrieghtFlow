import { IsString, IsOptional, IsEmail, IsIn } from 'class-validator';

export class CreateCarrierDto {
  @IsString()
  name: string;

  @IsIn(['trucking', 'airline', 'shipping'])
  type: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  country?: string;
}
