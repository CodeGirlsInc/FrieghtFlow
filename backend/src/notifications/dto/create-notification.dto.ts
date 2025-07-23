import { IsEnum, IsString, IsOptional, IsUUID, IsObject, IsDateString, IsNumber, Min, Max } from "class-validator"
import { NotificationType, NotificationChannel, NotificationPriority } from "../entities/notification.entity"

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  type: NotificationType

  @IsEnum(NotificationChannel)
  channel: NotificationChannel

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority

  @IsUUID()
  recipientId: string

  @IsString()
  recipientEmail: string

  @IsOptional()
  @IsString()
  recipientName?: string

  @IsString()
  title: string

  @IsString()
  message: string

  @IsOptional()
  @IsObject()
  data?: Record<string, any>

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>

  @IsOptional()
  @IsUUID()
  relatedEntityId?: string

  @IsOptional()
  @IsString()
  relatedEntityType?: string

  @IsOptional()
  @IsString()
  actionUrl?: string

  @IsOptional()
  @IsString()
  actionText?: string

  @IsOptional()
  @IsUUID()
  senderId?: string

  @IsOptional()
  @IsString()
  senderName?: string

  @IsOptional()
  @IsDateString()
  scheduledAt?: string

  @IsOptional()
  @IsDateString()
  expiresAt?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number
}
