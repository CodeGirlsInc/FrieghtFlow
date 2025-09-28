import { Controller, Get, Param } from '@nestjs/common';
import { InAppService } from './channels/in-app.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly inAppService: InAppService) {}

  @Get('in-app/:userId')
  getInAppMessages(@Param('userId') userId: string) {
    return this.inAppService.getMessagesForUser(userId);
  }
}