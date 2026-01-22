import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import {
  UpdateNotificationDto,
  NotificationResponseDto,
  UpdateNotificationPreferenceDto,
  NotificationPreferenceResponseDto,
} from '../dto';

// TODO: Add proper authentication guard when auth module is created
// import { AuthGuard } from '@nestjs/passport';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/v1/notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: [NotificationResponseDto],
  })
  async getNotifications(): Promise<NotificationResponseDto[]> {
    try {
      // TODO: Get userId from auth context
      const userId = 'placeholder-user-id';
      const notifications = await this.notificationService.getNotifications(userId);
      return notifications;
    } catch (error) {
      this.logger.error(`Failed to get notifications: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve notifications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotification(@Param('id') id: string): Promise<NotificationResponseDto> {
    try {
      // TODO: Get userId from auth context
      const userId = 'placeholder-user-id';
      const notification = await this.notificationService.getNotificationById(id, userId);

      if (!notification) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }

      return notification;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get notification: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  async markAsRead(@Param('id') id: string): Promise<NotificationResponseDto> {
    try {
      // TODO: Get userId from auth context
      const userId = 'placeholder-user-id';
      const notification = await this.notificationService.markAsRead(id, userId);

      if (!notification) {
        throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
      }

      return notification;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to mark notification as read: ${error.message}`);
      throw new HttpException(
        'Failed to mark notification as read',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Param('id') id: string): Promise<void> {
    try {
      // TODO: Get userId from auth context
      const userId = 'placeholder-user-id';
      await this.notificationService.deleteNotification(id, userId);
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`);
      throw new HttpException(
        'Failed to delete notification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('preferences/current')
  @ApiOperation({ summary: 'Get current user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences retrieved successfully',
    type: NotificationPreferenceResponseDto,
  })
  async getPreferences(): Promise<NotificationPreferenceResponseDto> {
    try {
      // TODO: Get userId from auth context
      const userId = 'placeholder-user-id';
      const preferences = await this.notificationService.getPreferences(userId);
      return preferences;
    } catch (error) {
      this.logger.error(`Failed to get preferences: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve preferences',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('preferences/current')
  @ApiOperation({ summary: 'Update current user notification preferences' })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    type: NotificationPreferenceResponseDto,
  })
  async updatePreferences(
    @Body() updateData: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceResponseDto> {
    try {
      // TODO: Get userId from auth context
      const userId = 'placeholder-user-id';
      const preferences = await this.notificationService.updatePreferences(userId, updateData);
      return preferences;
    } catch (error) {
      this.logger.error(`Failed to update preferences: ${error.message}`);
      throw new HttpException(
        'Failed to update preferences',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    try {
      // TODO: Get userId from auth context
      const userId = 'placeholder-user-id';
      const unreadCount = await this.notificationService.getUnreadCount(userId);
      return { unreadCount };
    } catch (error) {
      this.logger.error(`Failed to get unread count: ${error.message}`);
      throw new HttpException(
        'Failed to retrieve unread count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
