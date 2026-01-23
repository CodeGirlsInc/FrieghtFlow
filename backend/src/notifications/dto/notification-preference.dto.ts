import { IsUUID, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsString } from 'class-validator';

export class CreateNotificationPreferenceDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  inAppEnabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notificationTypes?: string[];
}

export class UpdateNotificationPreferenceDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  inAppEnabled?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notificationTypes?: string[];
}

export class NotificationPreferenceResponseDto {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  notificationTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}
