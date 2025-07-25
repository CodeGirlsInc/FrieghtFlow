import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsBoolean,
  IsDateString,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from "class-validator"
import { Type, Transform } from "class-transformer"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"
import { EmailCategory, EmailPriority } from "../interfaces/email.interface"

export class SendEmailDto {
  @ApiProperty({ description: "Recipient email address(es)" })
  @IsEmail({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  to: string | string[]

  @ApiPropertyOptional({ description: "CC email address(es)" })
  @IsOptional()
  @IsEmail({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  cc?: string | string[]

  @ApiPropertyOptional({ description: "BCC email address(es)" })
  @IsOptional()
  @IsEmail({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  bcc?: string | string[]

  @ApiPropertyOptional({ description: "Sender email address" })
  @IsOptional()
  @IsEmail()
  from?: string

  @ApiPropertyOptional({ description: "Reply-to email address" })
  @IsOptional()
  @IsEmail()
  replyTo?: string

  @ApiProperty({ description: "Email subject" })
  @IsString()
  subject: string

  @ApiPropertyOptional({ description: "HTML content" })
  @IsOptional()
  @IsString()
  htmlContent?: string

  @ApiPropertyOptional({ description: "Text content" })
  @IsOptional()
  @IsString()
  textContent?: string

  @ApiPropertyOptional({ description: "Template ID" })
  @IsOptional()
  @IsUUID()
  templateId?: string

  @ApiPropertyOptional({ description: "Template data" })
  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>

  @ApiProperty({ enum: EmailPriority, description: "Email priority" })
  @IsEnum(EmailPriority)
  priority: EmailPriority

  @ApiProperty({ enum: EmailCategory, description: "Email category" })
  @IsEnum(EmailCategory)
  category: EmailCategory

  @ApiPropertyOptional({ description: "Email tags" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @ApiPropertyOptional({ description: "Scheduled send time" })
  @IsOptional()
  @IsDateString()
  scheduledAt?: Date

  @ApiPropertyOptional({ description: "Email expiration time" })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date

  @ApiPropertyOptional({ description: "Enable tracking", default: true })
  @IsOptional()
  @IsBoolean()
  trackingEnabled?: boolean

  @ApiPropertyOptional({ description: "User ID" })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({ description: "Organization ID" })
  @IsOptional()
  @IsUUID()
  organizationId?: string

  @ApiPropertyOptional({ description: "Shipment ID" })
  @IsOptional()
  @IsUUID()
  shipmentId?: string

  @ApiPropertyOptional({ description: "Order ID" })
  @IsOptional()
  @IsUUID()
  orderId?: string

  @ApiPropertyOptional({ description: "Smart contract address" })
  @IsOptional()
  @IsString()
  contractAddress?: string

  @ApiPropertyOptional({ description: "Transaction hash" })
  @IsOptional()
  @IsString()
  transactionHash?: string
}

export class SendBulkEmailDto {
  @ApiProperty({ description: "Array of email messages", type: [SendEmailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendEmailDto)
  @ArrayMinSize(1)
  messages: SendEmailDto[]
}

export class SendTemplateEmailDto {
  @ApiProperty({ description: "Template ID" })
  @IsUUID()
  templateId: string

  @ApiProperty({ description: "Recipient email address(es)" })
  @IsEmail({}, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  to: string | string[]

  @ApiProperty({ description: "Template data" })
  @IsObject()
  data: Record<string, any>
}

export class CreateTemplateDto {
  @ApiProperty({ description: "Template name" })
  @IsString()
  name: string

  @ApiProperty({ description: "Email subject template" })
  @IsString()
  subject: string

  @ApiProperty({ description: "HTML content template" })
  @IsString()
  htmlContent: string

  @ApiProperty({ description: "Text content template" })
  @IsString()
  textContent: string

  @ApiProperty({ description: "Template variables", type: [String] })
  @IsArray()
  @IsString({ each: true })
  variables: string[]

  @ApiProperty({ enum: EmailCategory, description: "Email category" })
  @IsEnum(EmailCategory)
  category: EmailCategory

  @ApiPropertyOptional({ enum: EmailPriority, description: "Email priority", default: EmailPriority.NORMAL })
  @IsOptional()
  @IsEnum(EmailPriority)
  priority?: EmailPriority

  @ApiPropertyOptional({ description: "Template description" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: "Template version", default: "1.0.0" })
  @IsOptional()
  @IsString()
  version?: string

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ description: "Template name" })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({ description: "Email subject template" })
  @IsOptional()
  @IsString()
  subject?: string

  @ApiPropertyOptional({ description: "HTML content template" })
  @IsOptional()
  @IsString()
  htmlContent?: string

  @ApiPropertyOptional({ description: "Text content template" })
  @IsOptional()
  @IsString()
  textContent?: string

  @ApiPropertyOptional({ description: "Template variables", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[]

  @ApiPropertyOptional({ enum: EmailCategory, description: "Email category" })
  @IsOptional()
  @IsEnum(EmailCategory)
  category?: EmailCategory

  @ApiPropertyOptional({ enum: EmailPriority, description: "Email priority" })
  @IsOptional()
  @IsEnum(EmailPriority)
  priority?: EmailPriority

  @ApiPropertyOptional({ description: "Template description" })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: "Template version" })
  @IsOptional()
  @IsString()
  version?: string

  @ApiPropertyOptional({ description: "Template active status" })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional({ description: "Additional metadata" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>
}

export class EmailMetricsQueryDto {
  @ApiPropertyOptional({ description: "Start date for metrics" })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date

  @ApiPropertyOptional({ description: "End date for metrics" })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date
}

export class UnsubscribeDto {
  @ApiProperty({ description: "Email address to unsubscribe" })
  @IsEmail()
  email: string

  @ApiPropertyOptional({ enum: EmailCategory, description: "Email category to unsubscribe from" })
  @IsOptional()
  @IsEnum(EmailCategory)
  category?: EmailCategory

  @ApiPropertyOptional({ description: "Unsubscribe reason" })
  @IsOptional()
  @IsString()
  reason?: string
}
