import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from "@nestjs/common"
import type { ShipmentService } from "../services/shipment.service"
import type { CreateShipmentDto } from "../dto/create-shipment.dto"
import { JwtAuthGuard } from "../guards/jwt-auth.guard"
import { RolesGuard } from "../guards/roles.guard"
import { Roles } from "../decorators/roles.decorator"
import { UserRole } from "../entities/user.entity"
import type { ShipmentStatus } from "../entities/shipment.entity"

@Controller("shipments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentService.create(createShipmentDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findAll(@Query('organizationId') organizationId?: string, @Query('departmentId') departmentId?: string) {
    return this.shipmentService.findAll(organizationId, departmentId)
  }

  @Get('tracking/:trackingNumber')
  findByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentService.findByTrackingNumber(trackingNumber);
  }

  @Get("date-range/:organizationId")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getShipmentsByDateRange(
    @Param('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.shipmentService.getShipmentsByDateRange(organizationId, new Date(startDate), new Date(endDate))
  }

  @Get('department-stats/:departmentId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  getDepartmentStats(@Param('departmentId') departmentId: string) {
    return this.shipmentService.getDepartmentShipmentStats(departmentId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findOne(@Param('id') id: string) {
    return this.shipmentService.findOne(id);
  }

  @Patch(":id/status")
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  updateStatus(@Param('id') id: string, @Body('status') status: ShipmentStatus) {
    return this.shipmentService.updateStatus(id, status)
  }

  @Patch(":id/assign")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  assignToUser(@Param('id') id: string, @Body('userId') userId: string) {
    return this.shipmentService.assignToUser(id, userId)
  }
}
