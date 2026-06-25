import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationInboxService } from './notification-inbox.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@ApiTags('Notification Inbox')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications/inbox')
export class NotificationInboxController {
  constructor(private readonly inboxService: NotificationInboxService) {}

  @Get()
  @ApiOperation({ summary: 'Fetch my notification inbox (paginated)' })
  async getInbox(@CurrentUser() user: User, @Query() query: NotificationQueryDto) {
    return this.inboxService.findAll(user.id, query.page, query.limit, query.isRead);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@CurrentUser() user: User) {
    const count = await this.inboxService.unreadCount(user.id);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.inboxService.markRead(id, user.id);
    return { message: 'Notification marked as read' };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() user: User) {
    await this.inboxService.markAllRead(user.id);
    return { message: 'All notifications marked as read' };
  }
}