import { IsEnum, IsString, IsOptional, IsBoolean, IsArray } from "class-validator"
import { NotificationType, NotificationChannel } from "../entities/notification.entity"

export class CreateNotificationTemplateDto {
  @IsString()
  name: string

  @IsEnum(NotificationType)
  type: NotificationType

  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @IsString()
  subject: string

  @IsString()
  template: string

  @IsOptional()
  @IsString()
  htmlTemplate?: string

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  variables?: string[]

  @IsOptional()
  @IsString()
  defaultData?: Record<string, any>

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  language?: string

  @IsOptional()
  @IsString()
  description?: string
}
