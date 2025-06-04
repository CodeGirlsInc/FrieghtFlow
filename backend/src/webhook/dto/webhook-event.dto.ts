import { IsString, IsObject, IsOptional, IsEnum } from "class-validator"
import { WebhookProvider } from "../entities/webhook-event.entity"

export class WebhookEventDto {
  @IsString()
  @IsOptional()
  id?: string

  @IsEnum(WebhookProvider)
  provider: WebhookProvider

  @IsString()
  eventType: string

  @IsObject()
  payload: Record<string, any>

  @IsObject()
  @IsOptional()
  headers?: Record<string, any>
}

export class StripeWebhookDto {
  @IsString()
  id: string

  @IsString()
  type: string

  @IsObject()
  data: {
    object: Record<string, any>
  }

  @IsObject()
  @IsOptional()
  headers?: Record<string, any>
}

export class EmailWebhookDto {
  @IsString()
  id: string

  @IsString()
  event: string

  @IsObject()
  data: Record<string, any>

  @IsObject()
  @IsOptional()
  headers?: Record<string, any>
}
