import { Controller, Get, Post, Patch, Param, Query, UseGuards, DefaultValuePipe } from "@nestjs/common"
import type { NotificationService, NotificationFilters } from "../services/notification.service"
import type { SendNotificationDto } from "../dto/send-notification.dto"
import type { NotificationChannel, NotificationStatus } from "../entities/notification.entity"
import { RolesGuard } from "../../roles/guards/roles.guard"
import { PermissionsGuard } from "../../roles/guards/permissions.guard"
import { Roles } from "../../roles/decorators/roles.decorator"
import { RequirePermissions } from "../../roles/decorators/permissions.decorator"
import { RoleType } from "../../roles/entities/role.entity"
import { PermissionAction, PermissionResource } from "../../roles/entities/permission.entity"

@Controller("notifications")
@UseGuards(RolesGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post("send")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.CREATE, resource: PermissionResource.ALL })
  sendNotification(sendNotificationDto: SendNotificationDto) {
    return this.notificationService.sendNotification(sendNotificationDto)
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  findAll(
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Query("recipientId") recipientId?: string,
    @Query("type") type?: string,
    @Query("channel") channel?: NotificationChannel,
    @Query("status") status?: NotificationStatus,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const filters: NotificationFilters = {}

    if (recipientId) filters.recipientId = recipientId
    if (type) filters.type = type
    if (channel) filters.channel = channel
    if (status) filters.status = status
    if (startDate) filters.startDate = new Date(startDate)
    if (endDate) filters.endDate = new Date(endDate)

    return this.notificationService.findAll(page, limit, filters)
  }

  @Get("stats")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  getStats(@Query("recipientId") recipientId?: string) {
    return this.notificationService.getNotificationStats(recipientId)
  }

  @Get("unread-count/:recipientId")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  getUnreadCount(@Param("recipientId") recipientId: string) {
    return this.notificationService.getUnreadCount(recipientId)
  }

  @Get(":id")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  findOne(@Param("id") id: string) {
    return this.notificationService.findOne(id)
  }

  @Patch(":id/read")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.UPDATE, resource: PermissionResource.ALL })
  markAsRead(@Param("id") id: string) {
    return this.notificationService.markAsRead(id)
  }

  @Patch("bulk-read")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.UPDATE, resource: PermissionResource.ALL })
  bulkMarkAsRead(body: { recipientId: string; notificationIds?: string[] }) {
    return this.notificationService.bulkMarkAsRead(body.recipientId, body.notificationIds)
  }
}
