import { IsString, IsNotEmpty, IsNumber, Min, IsISO8601, IsOptional, Length } from "class-validator";
export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  @Length(3, 8)
  currency?: string;

  @IsISO8601()
  dueDate: string; // YYYY-MM-DD or ISO string
}
