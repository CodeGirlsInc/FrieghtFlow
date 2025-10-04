
import { IsEnum } from 'class-validator';
import { NotificationStatus } from '../entities/notification.entity';

export class UpdateNotificationStatusDto {
  @IsEnum(NotificationStatus)
  status: NotificationStatus;
}
