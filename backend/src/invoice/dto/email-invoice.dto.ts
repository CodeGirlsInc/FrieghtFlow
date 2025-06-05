import { IsArray, IsString, IsOptional, IsBoolean } from "class-validator"

export class EmailInvoiceDto {
  @IsArray()
  @IsString({ each: true })
  to: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cc?: string[]

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bcc?: string[]

  @IsOptional()
  @IsString()
  subject?: string

  @IsOptional()
  @IsString()
  message?: string

  @IsOptional()
  @IsBoolean()
  attachPdf?: boolean = true
}
