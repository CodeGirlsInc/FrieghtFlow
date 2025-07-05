import { IsEthereumAddress, IsNotEmpty, IsString, IsUUID } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class LinkWalletDto {
  @ApiProperty({
    description: "User ID to link the wallet to",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: "Ethereum wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
  })
  @IsEthereumAddress()
  @IsNotEmpty()
  walletAddress: string

  @ApiProperty({
    description: "Signature of the nonce message",
    example: "0x...",
  })
  @IsString()
  @IsNotEmpty()
  signature: string
}
