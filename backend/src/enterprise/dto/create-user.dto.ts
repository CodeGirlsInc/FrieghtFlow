import { IsString, IsEmail, IsEnum, IsOptional, IsUUID, IsNotEmpty } from "class-validator"
import { UserRole } from "../entities/user.entity"

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole

  @IsUUID()
  organizationId: string

  @IsUUID()
  @IsOptional()
  departmentId?: string
}
