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
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/decorators/public.decorator';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { BatchCreateShipmentsDto } from './dto/batch-create-shipments.dto';
import { BatchCreateResultDto } from './dto/batch-create-result.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { User } from '../users/entities/user.entity';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Response } from 'express';
import { pipeline } from 'node:stream/promises';
import { ExportShipmentsDto } from './dto/export-shipments.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

class DisputeBody {
  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}

class ResolveDisputeBody {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum([ShipmentStatus.COMPLETED, ShipmentStatus.CANCELLED])
  resolution?: ShipmentStatus.COMPLETED | ShipmentStatus.CANCELLED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

class CancelBody {
  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
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
      'Creates up to 50 shipments with per-item validation reporting. Each shipment is processed individually, and the response includes success/failure status for each item.',
  })
  @ApiResponse({
    status: 201,
    description: 'Batch processed with per-item results',
    type: BatchCreateResultDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error in batch data' })
  batchCreate(
    @CurrentUser() user: User,
    @Body() dto: BatchCreateShipmentsDto,
  ): Promise<BatchCreateResultDto> {
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

    // pipeline forwards stream errors and destroys the export stream if the
    // response closes early, releasing the database query/connection.
    await pipeline(exportResult.stream, res);
  }

  /**
   * Public shipment tracking.
   *
   * Marked `@Public()` because the frontend serves this on an unauthenticated
   * `/track/[trackingNumber]` page. Without it the global `JwtAuthGuard` covered
   * the route and anonymous visitors received 401 (issue #1669) — the route was
   * described as "public-style" but carried no decorator, and the tracking page's
   * second call, `GET /shipments/:id/history`, requires a logged-in party, so even
   * an authenticated stranger got 403.
   *
   * Because this is now reachable without credentials it carries its own throttle
   * and is backed by `findByTracking`, which returns a restricted projection
   * (status, route, ETA) with no price, email or wallet. The full record stays
   * behind authentication on `GET /shipments/:id`.
   */
  @Get('track/:trackingNumber')
  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiOperation({ summary: 'Track shipment by tracking number (public)' })
  @ApiParam({ name: 'trackingNumber', example: 'FF-ABC123-DEF456' })
  findByTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.findByTracking(trackingNumber);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get shipment by ID' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findOne(id, user);
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
    return this.shipmentsService.update(id, user.id, dto, user.role);
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get status history for a shipment' })
  getHistory(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.getHistory(id, user);
  }
}
