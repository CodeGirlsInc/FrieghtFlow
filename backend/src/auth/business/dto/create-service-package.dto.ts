import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsArray, IsOptional, Min, Length } from "class-validator"

export class CreateServicePackageDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  features: string[]

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationMonths?: number
}
