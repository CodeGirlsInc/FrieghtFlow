import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Res,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiProduces,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { BatchCreateShipmentsDto } from './dto/batch-create-shipments.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { User } from '../users/entities/user.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportShipmentsDto } from './dto/export-shipments.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

class DisputeBody {
  @ApiPropertyOptional()
  @IsString()
  reason: string;
}

class ResolveDisputeBody {
  @ApiPropertyOptional()
  @IsEnum([ShipmentStatus.COMPLETED, ShipmentStatus.CANCELLED])
  resolution: ShipmentStatus.COMPLETED | ShipmentStatus.CANCELLED;

  @ApiPropertyOptional()
  @IsString()
  reason: string;
}

class CancelBody {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  // ── Shipper actions ──────────────────────────────────────────────────────────

  @Post()
  @Throttle({ shipmentCreate: { limit: 10, ttl: 60_000 } })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create a new shipment (Shippers only)',
    description:
      'Authenticated users can create up to 10 shipments per minute on this endpoint.',
  })
  @ApiResponse({ status: 201, description: 'Shipment created' })
  @ApiResponse({
    status: 429,
    description:
      'Shipment creation rate limit exceeded. Authenticated users can create up to 10 shipments per minute.',
  })
  create(@CurrentUser() user: User, @Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(user.id, dto);
  }

  @Post('batch')
  @Throttle({ shipmentCreate: { limit: 5, ttl: 60_000 } })
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Create multiple shipments in a batch (max 50)',
    description:
      'Creates up to 50 shipments in a single transaction. If any shipment fails validation, the entire batch is rolled back.',
  })
  @ApiResponse({
    status: 201,
    description: 'Batch shipments created successfully',
  })
  @ApiResponse({ status: 400, description: 'Validation error in batch data' })
  batchCreate(@CurrentUser() user: User, @Body() dto: BatchCreateShipmentsDto) {
    return this.shipmentsService.batchCreate(user.id, dto);
  }

  @Patch(':id/confirm-delivery')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Shipper confirms delivery' })
  confirmDelivery(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.shipmentsService.confirmDelivery(id, user);
  }

  // ── Carrier actions ──────────────────────────────────────────────────────────

  @Get('marketplace')
  @ApiOperation({ summary: 'Browse available (PENDING) shipments — carriers' })
  findMarketplace(@Query() query: QueryShipmentDto) {
    return this.shipmentsService.findMarketplace(query);
  }

  @Patch(':id/accept')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Carrier accepts a shipment' })
  accept(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() carrier: User) {
    return this.shipmentsService.accept(id, carrier);
  }

  @Patch(':id/pickup')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Carrier marks shipment as in-transit (picked up)' })
  markInTransit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() carrier: User,
  ) {
    return this.shipmentsService.markInTransit(id, carrier);
  }

  @Patch(':id/deliver')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Carrier marks shipment as delivered' })
  markDelivered(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() carrier: User,
  ) {
    return this.shipmentsService.markDelivered(id, carrier);
  }

  // ── Shared actions ───────────────────────────────────────────────────────────

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SHIPPER)
  @ApiOperation({
    summary: 'Shipment analytics — admin sees all, shipper sees own',
  })
  getAnalytics(@CurrentUser() user: User, @Query() query: AnalyticsQueryDto) {
    return this.shipmentsService.getAnalytics(user, query);
  }

  @Get()
  @ApiOperation({
    summary: 'List my shipments (role-filtered)',
    description:
      'Optional origin and destination query params perform case-insensitive partial matching.',
  })
  findAll(@CurrentUser() user: User, @Query() query: QueryShipmentDto) {
    return this.shipmentsService.findAll(user, query);
  }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Export shipments as CSV or JSON',
    description:
      'Shippers export only their own shipments, while admins can export all shipments. Responses are streamed.',
  })
  @ApiResponse({ status: 200, description: 'Shipment export stream' })
  async exportShipments(
    @CurrentUser() user: User,
    @Query() query: ExportShipmentsDto,
    @Res() res: Response,
  ): Promise<void> {
    const exportResult = await this.shipmentsService.exportShipments(
      user,
      query.format,
    );

    res.setHeader('Content-Type', exportResult.contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${exportResult.fileName}"`,
    );

    await new Promise<void>((resolve, reject) => {
      exportResult.stream.once('error', reject);
      res.once('close', resolve);
      exportResult.stream.pipe(res);
    });
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Track shipment by tracking number (public-style)' })
  @ApiParam({ name: 'trackingNumber', example: 'FF-ABC123-DEF456' })
  findByTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.findByTracking(trackingNumber);
  }

  @Get(':id/bol')
  @ApiOperation({ summary: 'Download Bill of Lading PDF for a shipment' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'Bill of Lading PDF file' })
  @ApiResponse({
    status: 400,
    description: 'Shipment not in accepted status or beyond',
  })
  @ApiResponse({ status: 403, description: 'Not a party to this shipment' })
  async downloadBol(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, trackingNumber } = await this.shipmentsService.generateBol(
      id,
      user,
    );
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="BOL-${trackingNumber}.pdf"`,
    );
    res.end(buffer);
  }

  @Get(':id/invoice')
  @ApiOperation({
    summary: 'Download freight invoice PDF for a completed shipment',
  })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'Invoice PDF file' })
  @ApiResponse({ status: 400, description: 'Shipment not yet completed' })
  @ApiResponse({
    status: 403,
    description: 'Only the shipper or admin can access the invoice',
  })
  async downloadInvoice(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, trackingNumber } =
      await this.shipmentsService.generateInvoice(id, user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="INV-${trackingNumber}.pdf"`,
    );
    res.end(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update shipment details (PENDING only, shipper)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateShipmentDto,
  ) {
    return this.shipmentsService.update(id, user.id, dto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a shipment' })
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: CancelBody,
  ) {
    return this.shipmentsService.cancel(id, user, body.reason);
  }

  @Patch(':id/dispute')
  @ApiOperation({ summary: 'Raise a dispute on a shipment' })
  raiseDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() body: DisputeBody,
  ) {
    return this.shipmentsService.raiseDispute(id, user, body.reason);
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Admin resolves a disputed shipment' })
  resolveDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: User,
    @Body() body: ResolveDisputeBody,
  ) {
    return this.shipmentsService.resolveDispute(
      id,
      admin,
      body.resolution,
      body.reason,
    );
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get status history for a shipment' })
  getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.getHistory(id);
  }
}
