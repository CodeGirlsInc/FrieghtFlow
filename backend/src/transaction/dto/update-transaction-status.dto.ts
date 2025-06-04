import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator"
import { TransactionStatus } from "../entities/transaction.entity"

export class UpdateTransactionStatusDto {
  @IsEnum(TransactionStatus)
  status: TransactionStatus

  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string

  @IsString()
  @IsOptional()
  @MaxLength(255)
  changedBy?: string
}
