import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { User } from '../users/entities/user.entity';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new shipment (Shippers only)' })
  @ApiResponse({ status: 201, description: 'Shipment created' })
  create(@CurrentUser() user: User, @Body() dto: CreateShipmentDto) {
    return this.shipmentsService.create(user.id, dto);
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
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() carrier: User,
  ) {
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

  @Get()
  @ApiOperation({ summary: 'List my shipments (role-filtered)' })
  findAll(@CurrentUser() user: User, @Query() query: QueryShipmentDto) {
    return this.shipmentsService.findAll(user, query);
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Track shipment by tracking number (public-style)' })
  @ApiParam({ name: 'trackingNumber', example: 'FF-ABC123-DEF456' })
  findByTracking(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.findByTracking(trackingNumber);
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
    return this.shipmentsService.resolveDispute(id, admin, body.resolution, body.reason);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get status history for a shipment' })
  getHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.getHistory(id);
  }
}
