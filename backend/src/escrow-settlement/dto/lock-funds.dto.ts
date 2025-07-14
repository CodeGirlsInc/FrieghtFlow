import {
  IsString,
  IsNotEmpty,
  IsEthereumAddress,
  IsEnum,
  IsOptional,
  IsObject,
  IsDateString,
  Matches,
  Length,
  IsNumberString,
} from "class-validator"
import { Transform } from "class-transformer"
import { Currency } from "../entities/escrow-transaction.entity"

export class LockFundsDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  transactionId: string

  @IsNumberString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d+)?$/, { message: "Amount must be a valid decimal number" })
  amount: string

  @IsEnum(Currency)
  currency: Currency = Currency.ETH

  @IsEthereumAddress()
  senderAddress: string

  @IsEthereumAddress()
  recipientAddress: string

  @IsEthereumAddress()
  contractAddress: string

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  expiresAt?: Date

  @IsOptional()
  @IsNumberString()
  maxRetries?: number = 3
}
