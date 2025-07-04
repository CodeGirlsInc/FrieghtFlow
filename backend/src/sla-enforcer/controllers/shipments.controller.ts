import { Controller, Get, Post, Put, Param, Query, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger"
import type { ShipmentService } from "../services/shipment.service"
import type { CreateShipmentDto } from "../dto/create-shipment.dto"
import type { UpdateShipmentStatusDto } from "../dto/update-shipment-status.dto"
import { type Shipment, ShipmentStatus } from "../entities/shipment.entity"

@ApiTags("Shipments")
@Controller("shipments")
export class ShipmentsController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new shipment" })
  @ApiResponse({ status: 201, description: "Shipment created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @ApiResponse({ status: 409, description: "Tracking number already exists" })
  async createShipment(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    return this.shipmentService.createShipment(createShipmentDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all shipments" })
  @ApiResponse({ status: 200, description: "Shipments retrieved successfully" })
  @ApiQuery({ name: "status", required: false, enum: ShipmentStatus })
  @ApiQuery({ name: "customerId", required: false, description: "Filter by customer ID" })
  @ApiQuery({ name: "limit", required: false, description: "Number of results to return" })
  @ApiQuery({ name: "offset", required: false, description: "Number of results to skip" })
  async getAllShipments(
    @Query('status') status?: ShipmentStatus,
    @Query('customerId') customerId?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ shipments: Shipment[]; total: number }> {
    return this.shipmentService.getAllShipments(
      status,
      customerId,
      limit ? Number.parseInt(limit.toString()) : 50,
      offset ? Number.parseInt(offset.toString()) : 0,
    )
  }

  @Get(":id")
  @ApiOperation({ summary: "Get shipment by ID" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 200, description: "Shipment retrieved successfully" })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async getShipmentById(@Param('id') id: string): Promise<Shipment> {
    return this.shipmentService.getShipmentById(id)
  }

  @Get("tracking/:trackingNumber")
  @ApiOperation({ summary: "Get shipment by tracking number" })
  @ApiParam({ name: "trackingNumber", description: "Tracking number" })
  @ApiResponse({ status: 200, description: "Shipment retrieved successfully" })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async getShipmentByTrackingNumber(@Param('trackingNumber') trackingNumber: string): Promise<Shipment> {
    return this.shipmentService.getShipmentByTrackingNumber(trackingNumber)
  }

  @Put(":id/status")
  @ApiOperation({ summary: "Update shipment status" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 200, description: "Shipment status updated successfully" })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async updateShipmentStatus(@Param('id') id: string, updateDto: UpdateShipmentStatusDto): Promise<Shipment> {
    return this.shipmentService.updateShipmentStatus(id, updateDto)
  }

  @Post(":id/simulate-progress")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Simulate shipment progress for testing" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 200, description: "Shipment progress simulated" })
  async simulateShipmentProgress(@Param('id') id: string): Promise<Shipment[]> {
    return this.shipmentService.simulateShipmentProgress(id)
  }

  @Post("create-test-shipments")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create test shipments for SLA testing" })
  @ApiResponse({ status: 201, description: "Test shipments created" })
  async createTestShipments(): Promise<Shipment[]> {
    return this.shipmentService.createTestShipments()
  }
}
