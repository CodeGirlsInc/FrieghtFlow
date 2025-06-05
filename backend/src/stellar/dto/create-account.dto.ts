import { IsOptional, IsString, IsBoolean } from "class-validator"

export class CreateAccountDto {
  @IsOptional()
  @IsString()
  userId?: string

  @IsOptional()
  @IsBoolean()
  fundWithFriendbot?: boolean
}
