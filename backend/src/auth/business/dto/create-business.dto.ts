import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, Length, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { CreateBusinessProfileDto } from "./create-business-profile.dto"

export class CreateBusinessDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsOptional()
  @IsPhoneNumber()
  phone?: string

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBusinessProfileDto)
  profile?: CreateBusinessProfileDto

  @IsOptional()
  @IsString({ each: true })
  servicePackageIds?: string[]
}
