import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications/preferences')
export class NotificationPreferencesController {
  constructor(private readonly prefsService: NotificationPreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Get notification preferences for the current user' })
  get(@CurrentUser() user: User) {
    return this.prefsService.getOrCreate(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update notification preferences' })
  update(@CurrentUser() user: User, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.prefsService.update(user.id, dto);
  }
}
