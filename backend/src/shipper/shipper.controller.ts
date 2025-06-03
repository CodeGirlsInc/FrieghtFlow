import { Controller, Get, Post, Body, Patch, Param, Query, Request, HttpCode, HttpStatus } from "@nestjs/common"
import type { ShipperService } from "./shipper.service"
import type { CreateShipperDto } from "./dto/create-shipper.dto"
import type { UpdateShipperDto } from "./dto/update-shipper.dto"
import type { CreateShipmentDto } from "./dto/create-shipment.dto"
import type { UpdateShipmentStatusDto } from "./dto/update-shipment-status.dto"
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { ShipperGuard } from '../auth/guards/shipper.guard';

@Controller("shippers")
export class ShipperController {
  constructor(private readonly shipperService: ShipperService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createShipperDto: CreateShipperDto) {
    return await this.shipperService.register(createShipperDto);
  }

  @Post('verify-email/:token')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Param('token') token: string) {
    return await this.shipperService.verifyEmail(token);
  }

  // @UseGuards(JwtAuthGuard, ShipperGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    // Assuming req.user.id contains the shipper ID from JWT
    return await this.shipperService.findById(req.user.id);
  }

  // @UseGuards(JwtAuthGuard, ShipperGuard)
  @Patch("profile")
  async updateProfile(@Request() req: any, @Body() updateShipperDto: UpdateShipperDto) {
    return await this.shipperService.updateProfile(req.user.id, updateShipperDto)
  }

  // @UseGuards(JwtAuthGuard, ShipperGuard)
  @Post("shipments")
  @HttpCode(HttpStatus.CREATED)
  async createShipment(@Request() req: any, @Body() createShipmentDto: CreateShipmentDto) {
    return await this.shipperService.createShipment(req.user.id, createShipmentDto)
  }

  // @UseGuards(JwtAuthGuard, ShipperGuard)
  @Get("shipments")
  async getShipments(@Request() req: any, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return await this.shipperService.getShipperShipments(req.user.id, page, limit)
  }

  // @UseGuards(JwtAuthGuard, ShipperGuard)
  @Get("shipments/:id")
  async getShipment(@Request() req: any, @Param('id') shipmentId: string) {
    return await this.shipperService.getShipmentById(req.user.id, shipmentId)
  }

  // @UseGuards(JwtAuthGuard, ShipperGuard)
  @Patch("shipments/:id/status")
  async updateShipmentStatus(
    @Request() req: any,
    @Param('id') shipmentId: string,
    @Body() updateStatusDto: UpdateShipmentStatusDto,
  ) {
    return await this.shipperService.updateShipmentStatus(req.user.id, shipmentId, updateStatusDto)
  }

  // @UseGuards(JwtAuthGuard, ShipperGuard)
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return await this.shipperService.getDashboardStats(req.user.id);
  }

  // Public endpoint for tracking
  @Get('track/:trackingNumber')
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return await this.shipperService.getShipmentTracking(trackingNumber);
  }
}
