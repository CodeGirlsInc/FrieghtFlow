import { IsString, IsOptional, IsNumber, IsUUID, IsNotEmpty } from "class-validator"

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsNumber()
  @IsOptional()
  budget?: number

  @IsUUID()
  organizationId: string
}
