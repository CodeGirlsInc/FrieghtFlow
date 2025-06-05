import { IsString, IsEmail, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString } from "class-validator"
import { Type } from "class-transformer"

export class CustomerInfoDto {
  @IsString()
  name: string

  @IsEmail()
  email: string

  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  phone?: string

  @IsOptional()
  @IsString()
  taxId?: string
}

export class InvoiceItemDto {
  @IsString()
  description: string

  @IsNumber()
  @Min(0.01)
  quantity: number

  @IsNumber()
  @Min(0)
  unitPrice: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number
}

export class InvoiceMetadataDto {
  @IsOptional()
  @IsString()
  transactionId?: string

  @IsOptional()
  @IsString()
  orderId?: string

  @IsOptional()
  @IsString()
  shipmentId?: string

  @IsOptional()
  @IsString()
  paymentMethod?: string

  @IsOptional()
  @IsString()
  notes?: string
}

export class CreateInvoiceDto {
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[]

  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceMetadataDto)
  metadata?: InvoiceMetadataDto

  @IsOptional()
  @IsDateString()
  dueDate?: string

  @IsOptional()
  @IsDateString()
  issueDate?: string

  @IsOptional()
  @IsString()
  currency?: string

  @IsOptional()
  @IsString()
  paymentTerms?: string

  @IsOptional()
  @IsString()
  notes?: string
}
