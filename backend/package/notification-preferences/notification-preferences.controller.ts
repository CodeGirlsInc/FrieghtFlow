import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('api/notifications/preferences')
export class NotificationPreferencesController {
  constructor(private readonly service: NotificationPreferencesService) {}

  @Get()
  getPreferences(@Request() req: { user: { id: string } }) {
    return this.service.getPreferences(req.user.id);
  }

  @Patch()
  updatePreferences(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.service.updatePreferences(req.user.id, dto);
  }
}
