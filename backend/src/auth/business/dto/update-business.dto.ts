import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsBoolean, Length, IsIn } from "class-validator"

export class UpdateBusinessDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsPhoneNumber()
  phone?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  @IsIn(["pending", "active", "suspended", "inactive"])
  status?: "pending" | "active" | "suspended" | "inactive"
}
