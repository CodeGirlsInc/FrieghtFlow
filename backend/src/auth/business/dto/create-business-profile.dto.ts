import { IsOptional, IsString, IsNumber, IsUrl, ValidateNested, IsArray, Min, Max, Length } from "class-validator"
import { Type } from "class-transformer"

class AddressDto {
  @IsString()
  street: string

  @IsString()
  city: string

  @IsString()
  state: string

  @IsString()
  postalCode: string

  @IsString()
  country: string
}

class SocialMediaDto {
  @IsOptional()
  @IsUrl()
  facebook?: string

  @IsOptional()
  @IsUrl()
  twitter?: string

  @IsOptional()
  @IsUrl()
  linkedin?: string

  @IsOptional()
  @IsUrl()
  instagram?: string
}

export class CreateBusinessProfileDto {
  @IsOptional()
  @IsString()
  @Length(10, 255)
  businessDescription?: string

  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(new Date().getFullYear())
  yearEstablished?: number

  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number

  @IsOptional()
  @IsUrl()
  website?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessCategories?: string[]

  @IsOptional()
  @IsString()
  taxId?: string

  @IsOptional()
  @IsString()
  registrationNumber?: string
}
