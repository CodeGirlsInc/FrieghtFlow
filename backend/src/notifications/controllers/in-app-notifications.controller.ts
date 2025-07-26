import {
  Controller,
  Get,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import type { InAppNotificationService } from '../services/in-app-notification.service';
import { RolesGuard } from '../../roles/guards/roles.guard';
import { PermissionsGuard } from '../../roles/guards/permissions.guard';
import { Roles } from '../../roles/decorators/roles.decorator';
import { RequirePermissions } from '../../roles/decorators/permissions.decorator';
import { RoleType } from '../../roles/entities/role.entity';
import {
  PermissionAction,
  PermissionResource,
} from '../../roles/entities/permission.entity';

@Controller('in-app-notifications')
@UseGuards(RolesGuard, PermissionsGuard)
export class InAppNotificationsController {
  constructor(private readonly inAppService: InAppNotificationService) {}

  @Get('user/:userId')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  getUserNotifications(
    userId: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.inAppService.getUserNotifications(userId, limit);
  }

  @Get('user/:userId/unread-count')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  getUnreadCount(userId: string) {
    return this.inAppService.getUnreadCount(userId);
  }

  @Patch('user/:userId/notification/:notificationId/read')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.UPDATE,
    resource: PermissionResource.ALL,
  })
  markAsRead(userId: string, notificationId: string) {
    return this.inAppService.markAsRead(userId, notificationId);
  }

  @Patch('user/:userId/mark-all-read')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.UPDATE,
    resource: PermissionResource.ALL,
  })
  markAllAsRead(userId: string) {
    return this.inAppService.markAllAsRead(userId);
  }

  @Delete('user/:userId')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.DELETE,
    resource: PermissionResource.ALL,
  })
  clearUserNotifications(userId: string) {
    return this.inAppService.clearUserNotifications(userId);
  }

  @Get('queue/stats')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  getQueueStats() {
    return {
      queueSize: this.inAppService.getQueueSize(),
      totalUsers: this.inAppService
        .getAllQueuedNotifications()
        .then((queue) => queue.size),
    };
  }
}
