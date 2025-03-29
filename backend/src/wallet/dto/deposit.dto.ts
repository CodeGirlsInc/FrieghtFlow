import { IsNotEmpty, IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class DepositDto {
  @ApiProperty({
    description: "The amount to deposit",
    example: 100.5,
    minimum: 0.01,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number
}

