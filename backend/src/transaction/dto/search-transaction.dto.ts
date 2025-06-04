import { IsString, IsUUID, IsNumber, IsEnum, IsOptional, IsDateString, IsArray, Min, Max } from "class-validator"
import { Type } from "class-transformer"
import { TransactionStatus, TransactionGateway } from "../entities/transaction.entity"

export class SearchTransactionDto {
  @IsString()
  @IsOptional()
  transactionId?: string

  @IsUUID()
  @IsOptional()
  userId?: string

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  minAmount?: number

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxAmount?: number

  @IsString()
  @IsOptional()
  currency?: string

  @IsEnum(TransactionStatus, { each: true })
  @IsOptional()
  @IsArray()
  status?: TransactionStatus[]

  @IsEnum(TransactionGateway, { each: true })
  @IsOptional()
  @IsArray()
  gateway?: TransactionGateway[]

  @IsDateString()
  @IsOptional()
  startDate?: string

  @IsDateString()
  @IsOptional()
  endDate?: string

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0

  @IsString()
  @IsOptional()
  sortBy?: string = "createdAt"

  @IsString()
  @IsOptional()
  sortOrder?: "ASC" | "DESC" = "DESC"
}
