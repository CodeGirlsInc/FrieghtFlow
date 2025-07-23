import { Controller, Get, Post, Patch, Delete, UseGuards } from "@nestjs/common"
import type { NotificationPreferenceService } from "../services/notification-preference.service"
import type {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
  BulkUpdatePreferencesDto,
} from "../dto/notification-preference.dto"
import type { NotificationType, NotificationChannel } from "../entities/notification.entity"
import { RolesGuard } from "../../roles/guards/roles.guard"
import { PermissionsGuard } from "../../roles/guards/permissions.guard"
import { Roles } from "../../roles/decorators/roles.decorator"
import { RequirePermissions } from "../../roles/decorators/permissions.decorator"
import { RoleType } from "../../roles/entities/role.entity"
import { PermissionAction, PermissionResource } from "../../roles/entities/permission.entity"

@Controller("notification-preferences")
@UseGuards(RolesGuard, PermissionsGuard)
export class NotificationPreferencesController {
  constructor(private readonly preferenceService: NotificationPreferenceService) {}

  @Post()
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.CREATE, resource: PermissionResource.USER })
  create(createPreferenceDto: CreateNotificationPreferenceDto) {
    return this.preferenceService.create(createPreferenceDto)
  }

  @Post("bulk-update")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.UPDATE, resource: PermissionResource.USER })
  bulkUpdate(bulkUpdateDto: BulkUpdatePreferencesDto) {
    return this.preferenceService.bulkUpdatePreferences(bulkUpdateDto)
  }

  @Post("defaults/:userId")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.CREATE, resource: PermissionResource.USER })
  setDefaults(userId: string) {
    return this.preferenceService.setDefaultPreferences(userId)
  }

  @Get("user/:userId")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.USER })
  findByUser(userId: string) {
    return this.preferenceService.findByUser(userId)
  }

  @Get("user/:userId/summary")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.USER })
  getUserSummary(userId: string) {
    return this.preferenceService.getUserPreferenceSummary(userId)
  }

  @Get("user/:userId/enabled-channels/:type")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.USER })
  getEnabledChannels(userId: string, type: NotificationType) {
    return this.preferenceService.getEnabledChannels(userId, type)
  }

  @Patch("user/:userId/type/:type/channel/:channel")
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({ action: PermissionAction.UPDATE, resource: PermissionResource.USER })
  updatePreference(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    updateData: UpdateNotificationPreferenceDto,
  ) {
    return this.preferenceService.updatePreference(userId, type, channel, updateData)
  }

  @Delete(":id")
  @Roles(RoleType.ADMIN)
  @RequirePermissions({ action: PermissionAction.DELETE, resource: PermissionResource.USER })
  remove(id: string) {
    return this.preferenceService.remove(id)
  }
}
