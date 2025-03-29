import { IsNotEmpty, IsNumber, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class WithdrawDto {
  @ApiProperty({
    description: "The amount to withdraw",
    example: 50.25,
    minimum: 0.01,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number
}

