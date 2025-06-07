import { Controller, Get, Post, UseGuards } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { AnalyticsService } from "./analytics.service"
import type { ShipmentAnalyticsService } from "./services/shipment-analytics.service"
import type { UserAnalyticsService } from "./services/user-analytics.service"
import type { CarrierAnalyticsService } from "./services/carrier-analytics.service"
import {
  type TrackEventDto,
  type DateRangeDto,
  type PaginationDto,
  ShipmentVolumeDto,
  UserEngagementDto,
  CarrierPerformanceDto,
  DashboardMetricsDto,
} from "./dto/analytics.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { AdminGuard } from "../auth/guards/admin.guard"

@ApiTags("Analytics")
@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly shipmentAnalyticsService: ShipmentAnalyticsService,
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly carrierAnalyticsService: CarrierAnalyticsService,
  ) {}

  @Post("track")
  @ApiOperation({ summary: "Track analytics event" })
  @ApiResponse({ status: 201, description: "Event tracked successfully" })
  async trackEvent(trackEventDto: TrackEventDto) {
    return this.analyticsService.trackEvent(trackEventDto)
  }

  @Get("dashboard")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get dashboard metrics overview" })
  @ApiResponse({ status: 200, type: DashboardMetricsDto })
  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    return this.analyticsService.getDashboardMetrics()
  }

  @Get("shipments/volume")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get shipment volume analytics" })
  @ApiResponse({ status: 200, type: [ShipmentVolumeDto] })
  async getShipmentVolume(dateRange: DateRangeDto, pagination: PaginationDto): Promise<ShipmentVolumeDto[]> {
    return this.shipmentAnalyticsService.getShipmentVolume(dateRange, pagination)
  }

  @Get("shipments/trends")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get shipment trends" })
  async getShipmentTrends(dateRange: DateRangeDto) {
    return this.shipmentAnalyticsService.getShipmentTrends(dateRange)
  }

  @Get("users/engagement")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user engagement metrics" })
  @ApiResponse({ status: 200, type: [UserEngagementDto] })
  async getUserEngagement(dateRange: DateRangeDto): Promise<UserEngagementDto[]> {
    return this.userAnalyticsService.getUserEngagement(dateRange)
  }

  @Get("users/active")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get monthly active users" })
  async getMonthlyActiveUsers(dateRange: DateRangeDto) {
    return this.userAnalyticsService.getMonthlyActiveUsers(dateRange)
  }

  @Get("carriers/performance")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get carrier performance metrics" })
  @ApiResponse({ status: 200, type: [CarrierPerformanceDto] })
  async getCarrierPerformance(dateRange: DateRangeDto, pagination: PaginationDto): Promise<CarrierPerformanceDto[]> {
    return this.carrierAnalyticsService.getCarrierPerformance(dateRange, pagination)
  }

  @Get("carriers/success-rates")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get carrier success rates" })
  async getCarrierSuccessRates(dateRange: DateRangeDto) {
    return this.carrierAnalyticsService.getCarrierSuccessRates(dateRange)
  }

  @Get("revenue/trends")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get revenue trends" })
  async getRevenueTrends(dateRange: DateRangeDto) {
    return this.analyticsService.getRevenueTrends(dateRange)
  }

  @Get("events")
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get analytics events" })
  async getEvents(dateRange: DateRangeDto, pagination: PaginationDto) {
    return this.analyticsService.getEvents(dateRange, pagination)
  }
}
