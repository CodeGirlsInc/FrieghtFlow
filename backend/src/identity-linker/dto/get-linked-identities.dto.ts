import { IsOptional, IsUUID, IsEthereumAddress } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class GetLinkedIdentitiesDto {
  @ApiPropertyOptional({
    description: "Filter by user ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({
    description: "Filter by wallet address",
    example: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d4d4",
  })
  @IsOptional()
  @IsEthereumAddress()
  walletAddress?: string
}
