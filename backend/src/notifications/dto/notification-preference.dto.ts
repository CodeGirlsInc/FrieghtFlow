import {
  IsEnum,
  IsBoolean,
  IsOptional,
  IsObject,
  IsUUID,
} from 'class-validator';
import {
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';

export class CreateNotificationPreferenceDto {
  @IsUUID()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class BulkUpdatePreferencesDto {
  @IsUUID()
  userId: string;

  @IsObject()
  preferences: Record<
    string,
    { enabled: boolean; channels: NotificationChannel[] }
  >;
}
