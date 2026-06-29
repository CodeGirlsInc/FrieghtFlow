import { IsArray, IsBoolean, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationChannel, NotificationEventType } from '../entities/notification-preference.entity';

export class PreferenceItemDto {
  @IsEnum(NotificationEventType)
  eventType: NotificationEventType;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsBoolean()
  enabled: boolean;
}

export class UpdatePreferencesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreferenceItemDto)
  preferences: PreferenceItemDto[];
}
