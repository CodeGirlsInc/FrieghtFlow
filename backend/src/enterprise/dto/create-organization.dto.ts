import { IsString, IsEmail, IsOptional, IsNotEmpty } from "class-validator"

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsEmail()
  email: string
}
