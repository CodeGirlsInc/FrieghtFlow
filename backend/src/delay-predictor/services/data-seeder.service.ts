import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { ShipmentData } from "../entities/shipment-data.entity"

@Injectable()
export class DataSeederService {
  private readonly logger = new Logger(DataSeederService.name)

  constructor(private shipmentDataRepository: Repository<ShipmentData>) {}

  async seedMockData(): Promise<void> {
    const count = await this.shipmentDataRepository.count()
    if (count > 0) {
      this.logger.log("Mock data already exists, skipping seed")
      return
    }

    const mockData = this.generateMockShipmentData(1000)
    await this.shipmentDataRepository.save(mockData)
    this.logger.log(`Seeded ${mockData.length} mock shipment records`)
  }

  private generateMockShipmentData(count: number): Partial<ShipmentData>[] {
    const origins = ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ", "Philadelphia, PA"]
    const destinations = ["Miami, FL", "Seattle, WA", "Denver, CO", "Atlanta, GA", "Boston, MA", "San Francisco, CA"]
    const carriers = ["FedEx", "UPS", "DHL", "USPS", "Amazon Logistics"]
    const weatherConditions = ["clear", "rain", "snow", "storm", "fog"]
    const seasons = ["spring", "summer", "fall", "winter"]

    return Array.from({ length: count }, () => {
      const shipmentDate = this.randomDate(new Date(2022, 0, 1), new Date(2024, 11, 31))
      const expectedDelivery = new Date(shipmentDate)
      expectedDelivery.setDate(expectedDelivery.getDate() + Math.floor(Math.random() * 7) + 1)

      const actualDelivery = new Date(expectedDelivery)
      const delayDays = this.calculateDelay()
      actualDelivery.setDate(actualDelivery.getDate() + delayDays)

      const origin = origins[Math.floor(Math.random() * origins.length)]
      const destination = destinations[Math.floor(Math.random() * destinations.length)]

      return {
        origin,
        destination,
        carrier: carriers[Math.floor(Math.random() * carriers.length)],
        shipmentDate,
        expectedDeliveryDate: expectedDelivery,
        actualDeliveryDate: actualDelivery,
        delayDays,
        wasDelayed: delayDays > 0,
        distance: this.calculateDistance(origin, destination),
        weatherCondition: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        season: seasons[Math.floor(Math.random() * seasons.length)],
      }
    })
  }

  private randomDate(start: Date, end: Date): Date {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  private calculateDelay(): number {
    const random = Math.random()
    if (random < 0.7) return 0 // 70% on time
    if (random < 0.85) return Math.floor(Math.random() * 2) + 1 // 15% minor delay (1-2 days)
    if (random < 0.95) return Math.floor(Math.random() * 3) + 3 // 10% moderate delay (3-5 days)
    return Math.floor(Math.random() * 5) + 6 // 5% major delay (6-10 days)
  }

  private calculateDistance(origin: string, destination: string): number {
    // Mock distance calculation based on city pairs
    const distances = {
      "New York, NY-Los Angeles, CA": 2800,
      "Chicago, IL-Miami, FL": 1200,
      "Houston, TX-Seattle, WA": 2350,
      "Phoenix, AZ-Boston, MA": 2400,
    }

    const key = `${origin}-${destination}`
    return distances[key] || Math.floor(Math.random() * 3000) + 500
  }
}
