import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from "@nestjs/common"
import type { LogisticsRouteService } from "../services/logistics-route.service"
import type { CreateLogisticsRouteDto } from "../dto/create-logistics-route.dto"
import { JwtAuthGuard } from "../guards/jwt-auth.guard"
import { RolesGuard } from "../guards/roles.guard"
import { Roles } from "../decorators/roles.decorator"
import { UserRole } from "../entities/user.entity"
import type { RouteStatus } from "../entities/logistics-route.entity"

@Controller("logistics-routes")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticsRouteController {
  constructor(private readonly routeService: LogisticsRouteService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() createRouteDto: CreateLogisticsRouteDto) {
    return this.routeService.create(createRouteDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findAll(@Query('organizationId') organizationId?: string) {
    return this.routeService.findAll(organizationId);
  }

  @Get('active/:organizationId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  getActiveRoutes(@Param('organizationId') organizationId: string) {
    return this.routeService.getActiveRoutes(organizationId);
  }

  @Get(':id/performance')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getRoutePerformance(@Param('id') id: string) {
    return this.routeService.getRoutePerformance(id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.routeService.findOne(id);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateStatus(@Param('id') id: string, @Body() status: RouteStatus) {
    return this.routeService.updateStatus(id, status)
  }
}
