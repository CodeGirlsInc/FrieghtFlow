
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { NotificationStatus } from '../entities/notification.entity';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString() 
  @IsNotEmpty()
  message: string;
}
