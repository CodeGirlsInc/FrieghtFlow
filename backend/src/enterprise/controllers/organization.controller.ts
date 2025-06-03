import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import type { OrganizationService } from "../services/organization.service"
import type { CreateOrganizationDto } from "../dto/create-organization.dto"
import { JwtAuthGuard } from "../guards/jwt-auth.guard"
import { RolesGuard } from "../guards/roles.guard"
import { Roles } from "../decorators/roles.decorator"
import { UserRole } from "../entities/user.entity"

@Controller("organizations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationService.create(createOrganizationDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findAll() {
    return this.organizationService.findAll()
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getStats(@Param('id') id: string) {
    return this.organizationService.getOrganizationStats(id);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateOrganizationDto: Partial<CreateOrganizationDto>) {
    return this.organizationService.update(id, updateOrganizationDto)
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }
}
