import { IsEnum, IsNotEmpty } from 'class-validator';
import { InvoiceStatus } from '../entities/invoice.entity';

export class UpdateInvoiceDto {
  @IsEnum(InvoiceStatus)
  @IsNotEmpty()
  status: InvoiceStatus;
}
