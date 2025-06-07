import { Injectable } from "@nestjs/common"
import { type Repository, Between } from "typeorm"
import type { AnalyticsEvent } from "./entities/analytics-event.entity"
import type { MixpanelService } from "./services/mixpanel.service"
import type { ShipmentAnalyticsService } from "./services/shipment-analytics.service"
import type { UserAnalyticsService } from "./services/user-analytics.service"
import type { CarrierAnalyticsService } from "./services/carrier-analytics.service"
import type { TrackEventDto, DateRangeDto, PaginationDto, DashboardMetricsDto } from "./dto/analytics.dto"

@Injectable()
export class AnalyticsService {
  private readonly analyticsEventRepository: Repository<AnalyticsEvent>
  private readonly mixpanelService: MixpanelService
  private readonly shipmentAnalyticsService: ShipmentAnalyticsService
  private readonly userAnalyticsService: UserAnalyticsService
  private readonly carrierAnalyticsService: CarrierAnalyticsService

  constructor(
    analyticsEventRepository: Repository<AnalyticsEvent>,
    mixpanelService: MixpanelService,
    shipmentAnalyticsService: ShipmentAnalyticsService,
    userAnalyticsService: UserAnalyticsService,
    carrierAnalyticsService: CarrierAnalyticsService,
  ) {
    this.analyticsEventRepository = analyticsEventRepository
    this.mixpanelService = mixpanelService
    this.shipmentAnalyticsService = shipmentAnalyticsService
    this.userAnalyticsService = userAnalyticsService
    this.carrierAnalyticsService = carrierAnalyticsService
  }

  async trackEvent(trackEventDto: TrackEventDto): Promise<AnalyticsEvent> {
    // Save to local database
    const event = this.analyticsEventRepository.create(trackEventDto)
    const savedEvent = await this.analyticsEventRepository.save(event)

    // Send to Mixpanel (optional)
    await this.mixpanelService.track(trackEventDto)

    return savedEvent
  }

  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    const [totalUsers, activeUsers, totalShipments, totalRevenue, avgDeliveryTime, topCarriers, recentActivity] =
      await Promise.all([
        this.userAnalyticsService.getTotalUsers(),
        this.userAnalyticsService.getActiveUsersCount(),
        this.shipmentAnalyticsService.getTotalShipments(),
        this.getRevenue(),
        this.shipmentAnalyticsService.getAverageDeliveryTime(),
        this.carrierAnalyticsService.getTopCarriers(5),
        this.getRecentActivity(10),
      ])

    return {
      totalUsers,
      activeUsers,
      totalShipments,
      totalRevenue,
      avgDeliveryTime,
      topCarriers,
      recentActivity,
    }
  }

  async getRevenueTrends(dateRange: DateRangeDto) {
    const query = `
      SELECT 
        DATE(s.created_at) as date,
        SUM(s.total_amount) as revenue,
        COUNT(*) as shipment_count
      FROM shipments s
      WHERE s.created_at BETWEEN $1 AND $2
        AND s.status = 'delivered'
      GROUP BY DATE(s.created_at)
      ORDER BY date ASC
    `

    return this.analyticsEventRepository.query(query, [dateRange.startDate, dateRange.endDate])
  }

  async getEvents(dateRange: DateRangeDto, pagination: PaginationDto) {
    const { page = 1, limit = 10 } = pagination
    const skip = (page - 1) * limit

    const [events, total] = await this.analyticsEventRepository.findAndCount({
      where: {
        createdAt: Between(new Date(dateRange.startDate), new Date(dateRange.endDate)),
      },
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    })

    return {
      data: events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  private async getRevenue(): Promise<number> {
    const result = await this.analyticsEventRepository.query(`
      SELECT COALESCE(SUM(s.total_amount), 0) as total_revenue
      FROM shipments s
      WHERE s.status = 'delivered'
    `)

    return Number.parseFloat(result[0]?.total_revenue || 0)
  }

  private async getRecentActivity(limit: number): Promise<AnalyticsEvent[]> {
    return this.analyticsEventRepository.find({
      order: { createdAt: "DESC" },
      take: limit,
    })
  }
}
