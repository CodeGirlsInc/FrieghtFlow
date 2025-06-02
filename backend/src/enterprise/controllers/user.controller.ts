import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from "@nestjs/common"
import type { UserService } from "../services/user.service"
import type { CreateUserDto } from "../dto/create-user.dto"
import { JwtAuthGuard } from "../guards/jwt-auth.guard"
import { RolesGuard } from "../guards/roles.guard"
import { Roles } from "../decorators/roles.decorator"
import { UserRole } from "../entities/user.entity"

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll(@Query('organizationId') organizationId?: string) {
    return this.userService.findAll(organizationId);
  }

  @Get("by-role/:organizationId/:role")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getUsersByRole(@Param('organizationId') organizationId: string, @Param('role') role: UserRole) {
    return this.userService.getUsersByRole(organizationId, role)
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(":id/role")
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.userService.updateRole(id, role)
  }

  @Patch(":id/department")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  assignToDepartment(@Param('id') id: string, @Body('departmentId') departmentId: string) {
    return this.userService.assignToDepartment(id, departmentId)
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  deactivateUser(@Param('id') id: string) {
    return this.userService.deactivateUser(id);
  }
}
