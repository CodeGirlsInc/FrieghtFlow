import { Controller, Get, Post, Delete, Body, UseGuards } from '@nestjs/common';
import type {
  ShipmentCacheService,
  ShipmentStatus,
} from '../services/shipment-cache.service';
import type { WarmupCacheDto } from '../dto/cache.dto';
import { RolesGuard } from '../../roles/guards/roles.guard';
import { PermissionsGuard } from '../../roles/guards/permissions.guard';
import { Roles } from '../../roles/decorators/roles.decorator';
import { RequirePermissions } from '../../roles/decorators/permissions.decorator';
import { RoleType } from '../../roles/entities/role.entity';
import {
  PermissionAction,
  PermissionResource,
} from '../../roles/entities/permission.entity';

@Controller('cache/shipments')
@UseGuards(RolesGuard, PermissionsGuard)
export class ShipmentCacheController {
  constructor(private readonly shipmentCacheService: ShipmentCacheService) {}

  @Get('status/:shipmentId')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  async getShipmentStatus(shipmentId: string) {
    const status =
      await this.shipmentCacheService.getShipmentStatus(shipmentId);
    return {
      shipmentId,
      status,
      cached: status !== null,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('status/:shipmentId')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.CREATE,
    resource: PermissionResource.ALL,
  })
  async setShipmentStatus(shipmentId: string, @Body() status: ShipmentStatus) {
    const result = await this.shipmentCacheService.setShipmentStatus(
      shipmentId,
      status,
    );
    return {
      success: result,
      shipmentId,
      message: result
        ? 'Shipment status cached successfully'
        : 'Failed to cache shipment status',
    };
  }

  @Get('tracking/:trackingNumber')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  async getShipmentByTracking(trackingNumber: string) {
    const result =
      await this.shipmentCacheService.getShipmentByTracking(trackingNumber);
    return {
      trackingNumber,
      result,
      found: result !== null,
    };
  }

  @Delete('status/:shipmentId')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.DELETE,
    resource: PermissionResource.ALL,
  })
  async invalidateShipmentStatus(shipmentId: string) {
    await this.shipmentCacheService.invalidateShipmentStatus(shipmentId);
    return {
      success: true,
      shipmentId,
      message: 'Shipment status cache invalidated',
    };
  }

  @Get('user/:userId/shipments')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.USER,
  })
  async getUserShipments(userId: string) {
    const shipments = await this.shipmentCacheService.getUserShipments(userId);
    return {
      userId,
      shipments,
      cached: shipments !== null,
      count: shipments?.length || 0,
    };
  }

  @Post('user/:userId/shipments')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.CREATE,
    resource: PermissionResource.USER,
  })
  async setUserShipments(userId: string, @Body() shipments: ShipmentStatus[]) {
    const result = await this.shipmentCacheService.setUserShipments(
      userId,
      shipments,
    );
    return {
      success: result,
      userId,
      count: shipments.length,
      message: result
        ? 'User shipments cached successfully'
        : 'Failed to cache user shipments',
    };
  }

  @Get('events/:shipmentId')
  @Roles(RoleType.ADMIN, RoleType.ANALYST, RoleType.REVIEWER, RoleType.USER)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  async getShipmentEvents(shipmentId: string) {
    const events =
      await this.shipmentCacheService.getShipmentEvents(shipmentId);
    return {
      shipmentId,
      events,
      cached: events !== null,
      count: events?.length || 0,
    };
  }

  @Get('stats/:period')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ANALYTICS,
  })
  async getShipmentStats(period: 'daily' | 'weekly' | 'monthly') {
    const stats = await this.shipmentCacheService.getShipmentStats(period);
    return {
      period,
      stats,
      cached: stats !== null,
    };
  }

  @Post('stats/:period')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.CREATE,
    resource: PermissionResource.ANALYTICS,
  })
  async setShipmentStats(
    period: 'daily' | 'weekly' | 'monthly',
    @Body() stats: any,
  ) {
    const result = await this.shipmentCacheService.setShipmentStats(
      period,
      stats,
    );
    return {
      success: result,
      period,
      message: result
        ? 'Shipment stats cached successfully'
        : 'Failed to cache shipment stats',
    };
  }

  @Post('warmup')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.CREATE,
    resource: PermissionResource.ALL,
  })
  async warmupCache(@Body() warmupDto: WarmupCacheDto) {
    await this.shipmentCacheService.warmupCache(warmupDto.shipmentIds);
    return {
      success: true,
      count: warmupDto.shipmentIds.length,
      message: `Cache warmed up for ${warmupDto.shipmentIds.length} shipments`,
    };
  }

  @Get('health')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.READ,
    resource: PermissionResource.ALL,
  })
  async getCacheHealth() {
    return await this.shipmentCacheService.getCacheHealth();
  }

  @Delete('clear')
  @Roles(RoleType.ADMIN)
  @RequirePermissions({
    action: PermissionAction.DELETE,
    resource: PermissionResource.ALL,
  })
  async clearAllCache() {
    const result = await this.shipmentCacheService.clearAllShipmentCache();
    return {
      success: result,
      message: result
        ? 'All shipment cache cleared successfully'
        : 'Failed to clear shipment cache',
    };
  }

  @Delete('user/:userId/queries')
  @Roles(RoleType.ADMIN, RoleType.ANALYST)
  @RequirePermissions({
    action: PermissionAction.DELETE,
    resource: PermissionResource.USER,
  })
  async invalidateUserQueries(userId: string) {
    await this.shipmentCacheService.invalidateQueriesForUser(userId);
    return {
      success: true,
      userId,
      message: 'User query caches invalidated',
    };
  }
}
