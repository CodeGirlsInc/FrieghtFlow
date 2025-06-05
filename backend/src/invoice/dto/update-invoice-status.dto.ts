import { IsEnum, IsOptional, IsNumber, Min } from "class-validator"
import { InvoiceStatus, PaymentStatus } from "../types/invoice.types"

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus
}

export class UpdatePaymentStatusDto {
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number
}
