import { IsDateString, IsEnum, IsOptional, IsString, IsArray } from "class-validator"
import { TransactionStatus, TransactionGateway } from "../entities/transaction.entity"

export class TransactionReportDto {
  @IsDateString()
  startDate: string

  @IsDateString()
  endDate: string

  @IsEnum(TransactionStatus, { each: true })
  @IsOptional()
  @IsArray()
  status?: TransactionStatus[]

  @IsEnum(TransactionGateway, { each: true })
  @IsOptional()
  @IsArray()
  gateway?: TransactionGateway[]

  @IsString()
  @IsOptional()
  currency?: string

  @IsString()
  @IsOptional()
  groupBy?: "day" | "week" | "month" | "status" | "gateway" | "currency" = "day"
}

export class TransactionReportResponseDto {
  period: string
  totalTransactions: number
  totalAmount: number
  currency: string
  successRate: number
  averageAmount: number
  breakdown: {
    [key: string]: {
      count: number
      amount: number
      percentage: number
    }
  }
}
