import { IsOptional, IsString, IsDateString, IsEnum, IsNumber, Min } from "class-validator"
import { Transform, Type } from "class-transformer"
import { WebhookStatus } from "../entities/webhook-event.entity"

export class FilterWebhookEventsDto {
  @IsOptional()
  @IsString()
  source?: string

  @IsOptional()
  @IsString()
  eventType?: string

  @IsOptional()
  @IsString()
  eventId?: string

  @IsOptional()
  @IsEnum(WebhookStatus)
  status?: WebhookStatus

  @IsOptional()
  @IsDateString()
  startDate?: string

  @IsOptional()
  @IsDateString()
  endDate?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50

  @IsOptional()
  @Transform(({ value }) => value === "true")
  sortByDateDesc?: boolean = true
}
