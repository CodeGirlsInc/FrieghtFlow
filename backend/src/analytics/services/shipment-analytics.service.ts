import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Shipment } from "../../shipment/entities/shipment.entity"
import type { DateRangeDto, PaginationDto, ShipmentVolumeDto } from "../dto/analytics.dto"

@Injectable()
export class ShipmentAnalyticsService {
  private readonly shipmentRepository: Repository<Shipment>

  constructor(shipmentRepository: Repository<Shipment>) {
    this.shipmentRepository = shipmentRepository
  }

  async getShipmentVolume(dateRange: DateRangeDto, pagination: PaginationDto): Promise<ShipmentVolumeDto[]> {
    const { page = 1, limit = 10 } = pagination
    const offset = (page - 1) * limit

    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_shipments,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_shipments,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_shipments,
        COUNT(CASE WHEN status IN ('pending', 'in_transit') THEN 1 END) as pending_shipments,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount END), 0) as revenue
      FROM shipments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT $3 OFFSET $4
    `

    const results = await this.shipmentRepository.query(query, [dateRange.startDate, dateRange.endDate, limit, offset])

    return results.map((row: any) => ({
      date: row.date,
      totalShipments: Number.parseInt(row.total_shipments),
      deliveredShipments: Number.parseInt(row.delivered_shipments),
      cancelledShipments: Number.parseInt(row.cancelled_shipments),
      pendingShipments: Number.parseInt(row.pending_shipments),
      revenue: Number.parseFloat(row.revenue),
    }))
  }

  async getShipmentTrends(dateRange: DateRangeDto) {
    const query = `
      SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as shipment_count,
        AVG(total_amount) as avg_shipment_value,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) * 100.0 / COUNT(*) as success_rate
      FROM shipments
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY week ASC
    `

    return this.shipmentRepository.query(query, [dateRange.startDate, dateRange.endDate])
  }

  async getTotalShipments(): Promise<number> {
    return this.shipmentRepository.count()
  }

  async getAverageDeliveryTime(): Promise<number> {
    const result = await this.shipmentRepository.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (delivered_at - created_at))/3600) as avg_hours
      FROM shipments
      WHERE status = 'delivered' AND delivered_at IS NOT NULL
    `)

    return Number.parseFloat(result[0]?.avg_hours || 0)
  }
}
