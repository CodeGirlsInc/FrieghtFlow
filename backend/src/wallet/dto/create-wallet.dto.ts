import { IsNotEmpty, IsString, IsUUID, Length } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class CreateWalletDto {
  @ApiProperty({
    description: "The ID of the user who owns this wallet",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: "The currency of the wallet (3-letter code)",
    example: "USD",
  })
  @IsString()
  @Length(3, 3)
  @IsNotEmpty()
  currency: string
}

