import { IsEthereumAddress, IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class GenerateNonceDto {
  @ApiProperty({
    description: "Ethereum wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
  })
  @IsEthereumAddress()
  @IsNotEmpty()
  walletAddress: string
}
