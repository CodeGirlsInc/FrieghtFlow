import { Controller, Get, Delete, UseGuards } from "@nestjs/common"
import type { EmailService } from "../services/email.service"
import { RolesGuard } from "../../roles/guards/roles.guard"
import { PermissionsGuard } from "../../roles/guards/permissions.guard"
import { Roles } from "../../roles/decorators/roles.decorator"
import { RequirePermissions } from "../../roles/decorators/permissions.decorator"
import { RoleType } from "../../roles/entities/role.entity"
import { PermissionAction, PermissionResource } from "../../roles/entities/permission.entity"

@Controller("email-debug")
@UseGuards(RolesGuard, PermissionsGuard)
export class EmailDebugController {
  constructor(private readonly emailService: EmailService) {}

  @Get("queue")
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({ action: PermissionAction.READ, resource: PermissionResource.ALL })
  getEmailQueue() {
    return {
      queue: this.emailService.getEmailQueue(),
      queueSize: this.emailService.getQueueSize(),
    }
  }

  @Delete("queue")
  @Roles(RoleType.ADMIN)
  @RequirePermissions({ action: PermissionAction.DELETE, resource: PermissionResource.ALL })
  clearEmailQueue() {
    this.emailService.clearEmailQueue()
    return { message: "Email queue cleared" }
  }
}
