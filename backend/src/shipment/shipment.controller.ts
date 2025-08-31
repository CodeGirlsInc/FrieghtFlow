import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from "@nestjs/swagger";
import { ShipmentService } from "./shipment.service";
import { CreateShipmentDto } from "./dto/create-shipment.dto";
import { UpdateShipmentDto } from "./dto/update-shipment.dto";
import { UpdateShipmentStatusDto } from "./dto/update-shipment-status.dto";
import { Shipment } from "./shipment.entity";
import { ShipmentStatusHistory } from "./shipment-status-history.entity";

@ApiTags("shipments")
@Controller("shipments")
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @Post()
  @ApiOperation({ summary: "Create a new shipment" })
  @ApiResponse({ status: 201, description: "Shipment created successfully", type: Shipment })
  @ApiResponse({ status: 400, description: "Bad request" })
  async create(@Body() createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    return this.shipmentService.create(createShipmentDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all shipments" })
  @ApiResponse({ status: 200, description: "List of all shipments", type: [Shipment] })
  async findAll(): Promise<Shipment[]> {
    return this.shipmentService.findAll();
  }

  @Get("search")
  @ApiOperation({ summary: "Search shipments by query" })
  @ApiQuery({ name: "q", description: "Search query for tracking ID, origin, destination, or carrier" })
  @ApiResponse({ status: 200, description: "Search results", type: [Shipment] })
  async search(@Query("q") query: string): Promise<Shipment[]> {
    return this.shipmentService.searchShipments(query);
  }

  @Get("tracking/:trackingId")
  @ApiOperation({ summary: "Get shipment by tracking ID" })
  @ApiParam({ name: "trackingId", description: "Shipment tracking ID" })
  @ApiResponse({ status: 200, description: "Shipment found", type: Shipment })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async findByTrackingId(@Param("trackingId") trackingId: string): Promise<Shipment> {
    return this.shipmentService.findByTrackingId(trackingId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get shipment by ID" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 200, description: "Shipment found", type: Shipment })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async findOne(@Param("id") id: string): Promise<Shipment> {
    return this.shipmentService.findOne(id);
  }

  @Get(":id/status-history")
  @ApiOperation({ summary: "Get shipment status history" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 200, description: "Status history", type: [ShipmentStatusHistory] })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async getStatusHistory(@Param("id") id: string): Promise<ShipmentStatusHistory[]> {
    return this.shipmentService.getStatusHistory(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update shipment details" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 200, description: "Shipment updated successfully", type: Shipment })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async update(
    @Param("id") id: string,
    @Body() updateShipmentDto: UpdateShipmentDto
  ): Promise<Shipment> {
    return this.shipmentService.update(id, updateShipmentDto);
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update shipment status" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 200, description: "Status updated successfully", type: Shipment })
  @ApiResponse({ status: 400, description: "Bad request - cannot update delivered/cancelled shipments" })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateShipmentStatusDto
  ): Promise<Shipment> {
    return this.shipmentService.updateStatus(id, updateStatusDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete shipment" })
  @ApiParam({ name: "id", description: "Shipment ID" })
  @ApiResponse({ status: 204, description: "Shipment deleted successfully" })
  @ApiResponse({ status: 404, description: "Shipment not found" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.shipmentService.remove(id);
  }
}
