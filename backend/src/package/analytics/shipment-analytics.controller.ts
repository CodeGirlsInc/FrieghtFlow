import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import { ShipmentAnalyticsService, ShipmentAnalyticsResult } from './shipment-analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('api/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShipmentAnalyticsController {
  constructor(private readonly analyticsService: ShipmentAnalyticsService) {}

  @Get('shipments')
  @Roles(UserRole.ADMIN, UserRole.SHIPPER)
  getShipmentAnalytics(
    @Query() query: AnalyticsQueryDto,
  ): Promise<ShipmentAnalyticsResult> {
    return this.analyticsService.getAnalytics(query);
  }
}
