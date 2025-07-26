import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import type { NotificationTemplateService } from '../services/notification-template.service';
import type { CreateNotificationTemplateDto } from '../dto/create-template.dto';
import type {
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';
import { RolesGuard } from '../../roles/guards/roles.guard';
import { PermissionsGuard } from '../../roles/guards/permissions.guard';
import { Roles } from '../../roles/decorators/roles.decorator';
import { RequirePermissions } from '../../roles/decorators/permissions.decorator';
import { RoleType } from '../../roles/entities/role.entity';
import {
  PermissionAction,
  PermissionResource,
} from '../../roles/entities/permission.entity';

@Controller('notification-templates')
@UseGuards(RolesGuard, PermissionsGuard)
export class NotificationTemplatesController {
  constructor(private readonly templateService: NotificationTemplateService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @RequirePermissions({
    action: PermissionAction.CREATE,
    resource: PermissionResource.ALL,
  })
  create(createTemplateDto: CreateNotificationTemplateDto) {
    return this.templateService.create(createTemplateDto);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  findAll() {
    return this.templateService.findAll();
  }

  @Get('type/:type/channel/:channel')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  findByTypeAndChannel(
    @Param('type') type: string,
    @Param('channel') channel: string,
  ) {
    return this.templateService.findByTypeAndChannel(
      type as NotificationType,
      channel as NotificationChannel,
    );
  }

  @Get('name/:name')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  findByName(@Param('name') name: string) {
    return this.templateService.findByName(name);
  }

  @Get('name/:name/variables')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  getTemplateVariables(@Param('name') name: string) {
    return this.templateService.getTemplateVariables(name);
  }

  @Post('name/:name/validate')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  validateTemplate(@Param('name') name: string, data: Record<string, any>) {
    return this.templateService.validateTemplate(name, data);
  }

  @Post('name/:name/process')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  processTemplate(@Param('name') name: string, data: Record<string, any>) {
    return this.templateService.processTemplate(name, data);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @RequirePermissions({
    action: PermissionAction.UPDATE,
    resource: PermissionResource.ALL,
  })
  update(
    @Param('id') id: string,
    updateData: Partial<CreateNotificationTemplateDto>,
  ) {
    return this.templateService.update(id, updateData);
  }

  @Delete(':id')
  @Roles(RoleType.ADMIN)
  @RequirePermissions({
    action: PermissionAction.DELETE,
    resource: PermissionResource.ALL,
  })
  remove(@Param('id') id: string) {
    return this.templateService.remove(id);
  }
}
