import { Transform, Type } from "class-transformer"
import { IsOptional, IsEnum, IsString, IsNumber, Min, Max, IsDateString, IsEthereumAddress } from "class-validator"
import { TransactionType, TransactionStatus, Currency } from "../entities/escrow-transaction.entity"

export class QueryEscrowTransactionDto {
  @IsOptional()
  @IsString()
  transactionId?: string

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency

  @IsOptional()
  @IsEthereumAddress()
  senderAddress?: string

  @IsOptional()
  @IsEthereumAddress()
  recipientAddress?: string

  @IsOptional()
  @IsDateString()
  fromDate?: string

  @IsOptional()
  @IsDateString()
  toDate?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0

  @IsOptional()
  @IsString()
  sortBy?: string = "createdAt"

  @IsOptional()
  @IsEnum(["ASC", "DESC"])
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: "ASC" | "DESC" = "DESC"
}
