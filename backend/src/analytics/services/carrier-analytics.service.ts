import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Carrier } from "../../carrier/entities/carrier.entity"
import type { Shipment } from "../../shipment/entities/shipment.entity"
import type { DateRangeDto, PaginationDto, CarrierPerformanceDto } from "../dto/analytics.dto"

@Injectable()
export class CarrierAnalyticsService {
  private readonly carrierRepository: Repository<Carrier>
  private readonly shipmentRepository: Repository<Shipment>

  constructor(carrierRepository: Repository<Carrier>, shipmentRepository: Repository<Shipment>) {
    this.carrierRepository = carrierRepository
    this.shipmentRepository = shipmentRepository
  }

  async getCarrierPerformance(dateRange: DateRangeDto, pagination: PaginationDto): Promise<CarrierPerformanceDto[]> {
    const { page = 1, limit = 10 } = pagination
    const offset = (page - 1) * limit

    const query = `
      SELECT 
        c.id as carrier_id,
        c.name as carrier_name,
        COUNT(s.id) as total_shipments,
        COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as successful_deliveries,
        (COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) * 100.0 / NULLIF(COUNT(s.id), 0)) as success_rate,
        AVG(CASE WHEN s.status = 'delivered' THEN EXTRACT(EPOCH FROM (s.delivered_at - s.created_at))/3600 END) as avg_delivery_time,
        COALESCE(AVG(r.rating), 0) as rating
      FROM carriers c
      LEFT JOIN shipments s ON c.id = s.carrier_id 
        AND s.created_at BETWEEN $1 AND $2
      LEFT JOIN reviews r ON c.id = r.carrier_id
      GROUP BY c.id, c.name
      HAVING COUNT(s.id) > 0
      ORDER BY success_rate DESC, total_shipments DESC
      LIMIT $3 OFFSET $4
    `

    const results = await this.carrierRepository.query(query, [dateRange.startDate, dateRange.endDate, limit, offset])

    return results.map((row: any) => ({
      carrierId: row.carrier_id,
      carrierName: row.carrier_name,
      totalShipments: Number.parseInt(row.total_shipments),
      successfulDeliveries: Number.parseInt(row.successful_deliveries),
      successRate: Number.parseFloat(row.success_rate),
      avgDeliveryTime: Number.parseFloat(row.avg_delivery_time),
      rating: Number.parseFloat(row.rating),
    }))
  }

  async getCarrierSuccessRates(dateRange: DateRangeDto) {
    const query = `
      SELECT 
        c.name as carrier_name,
        COUNT(s.id) as total_shipments,
        COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) as cancelled,
        (COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) * 100.0 / NULLIF(COUNT(s.id), 0)) as success_rate
      FROM carriers c
      LEFT JOIN shipments s ON c.id = s.carrier_id 
        AND s.created_at BETWEEN $1 AND $2
      GROUP BY c.id, c.name
      HAVING COUNT(s.id) > 0
      ORDER BY success_rate DESC
    `

    return this.carrierRepository.query(query, [dateRange.startDate, dateRange.endDate])
  }

  async getTopCarriers(limit: number): Promise<CarrierPerformanceDto[]> {
    const query = `
      SELECT 
        c.id as carrier_id,
        c.name as carrier_name,
        COUNT(s.id) as total_shipments,
        COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) as successful_deliveries,
        (COUNT(CASE WHEN s.status = 'delivered' THEN 1 END) * 100.0 / NULLIF(COUNT(s.id), 0)) as success_rate,
        AVG(CASE WHEN s.status = 'delivered' THEN EXTRACT(EPOCH FROM (s.delivered_at - s.created_at))/3600 END) as avg_delivery_time,
        COALESCE(AVG(r.rating), 0) as rating
      FROM carriers c
      LEFT JOIN shipments s ON c.id = s.carrier_id
      LEFT JOIN reviews r ON c.id = r.carrier_id
      GROUP BY c.id, c.name
      HAVING COUNT(s.id) > 0
      ORDER BY success_rate DESC, total_shipments DESC
      LIMIT $1
    `

    const results = await this.carrierRepository.query(query, [limit])

    return results.map((row: any) => ({
      carrierId: row.carrier_id,
      carrierName: row.carrier_name,
      totalShipments: Number.parseInt(row.total_shipments),
      successfulDeliveries: Number.parseInt(row.successful_deliveries),
      successRate: Number.parseFloat(row.success_rate),
      avgDeliveryTime: Number.parseFloat(row.avg_delivery_time),
      rating: Number.parseFloat(row.rating),
    }))
  }
}
