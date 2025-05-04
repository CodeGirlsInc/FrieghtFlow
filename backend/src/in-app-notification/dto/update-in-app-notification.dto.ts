import { PartialType } from '@nestjs/mapped-types';
import { CreateInAppNotificationDto } from './create-in-app-notification.dto';

export class UpdateInAppNotificationDto extends PartialType(CreateInAppNotificationDto) {}
