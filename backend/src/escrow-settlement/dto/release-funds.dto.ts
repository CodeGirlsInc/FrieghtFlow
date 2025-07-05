import { IsString, IsNotEmpty, IsEthereumAddress, IsOptional, IsObject, Length } from "class-validator"

export class ReleaseFundsDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  transactionId: string

  @IsEthereumAddress()
  recipientAddress: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}
