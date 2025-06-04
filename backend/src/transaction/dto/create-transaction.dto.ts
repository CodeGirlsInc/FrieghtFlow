import {
  IsString,
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  Length,
  IsPositive,
  MaxLength,
} from "class-validator"
import { TransactionStatus, TransactionGateway } from "../entities/transaction.entity"

export class CreateTransactionDto {
  @IsString()
  @Length(1, 255)
  transactionId: string

  @IsUUID()
  userId: string

  @IsNumber()
  @IsPositive()
  amount: number

  @IsString()
  @Length(3, 10)
  currency: string

  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus = TransactionStatus.PENDING

  @IsEnum(TransactionGateway)
  gateway: TransactionGateway

  @IsString()
  @IsOptional()
  @MaxLength(255)
  gatewayTransactionId?: string

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any> = {}

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string

  @IsString()
  @IsOptional()
  @MaxLength(255)
  reference?: string
}
