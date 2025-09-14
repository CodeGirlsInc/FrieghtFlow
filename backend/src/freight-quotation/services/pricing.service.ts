import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { PricingConfig } from "../entities/pricing-config.entity"
import type { CargoType } from "../entities/freight-quote.entity"

export interface PricingCalculationInput {
  cargoType: CargoType
  weight: number
  distance: number
}

export interface PricingCalculationResult {
  basePrice: number
  distanceCharge: number
  cargoTypeMultiplier: number
  totalPrice: number
  minimumCharge: number
  finalPrice: number
}

@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name)

  private pricingConfigRepository: Repository<PricingConfig>

  constructor(pricingConfigRepository: Repository<PricingConfig>) {
    this.pricingConfigRepository = pricingConfigRepository
    this.logger.log(`PricingService initialized with repository: ${pricingConfigRepository}`)
  }

  async calculatePrice(input: PricingCalculationInput): Promise<PricingCalculationResult> {
    this.logger.log(
      `Calculating price for cargo type: ${input.cargoType}, weight: ${input.weight}kg, distance: ${input.distance}km`,
    )

    const config = await this.getPricingConfig(input.cargoType)

    const basePrice = Number(config.baseRatePerKg) * input.weight
    const distanceCharge = basePrice * Number(config.distanceMultiplier) * input.distance
    const subtotal = basePrice + distanceCharge
    const totalPrice = subtotal * Number(config.cargoTypeMultiplier)
    const finalPrice = Math.max(totalPrice, Number(config.minimumCharge))

    const result: PricingCalculationResult = {
      basePrice: Number(basePrice.toFixed(2)),
      distanceCharge: Number(distanceCharge.toFixed(2)),
      cargoTypeMultiplier: Number(config.cargoTypeMultiplier),
      totalPrice: Number(totalPrice.toFixed(2)),
      minimumCharge: Number(config.minimumCharge),
      finalPrice: Number(finalPrice.toFixed(2)),
    }

    this.logger.log(`Price calculation result: ${JSON.stringify(result)}`)
    return result
  }

  async getPricingConfig(cargoType: CargoType): Promise<PricingConfig> {
    const config = await this.pricingConfigRepository.findOne({
      where: { cargoType, isActive: true },
    })

    if (!config) {
      throw new NotFoundException(`No active pricing configuration found for cargo type: ${cargoType}`)
    }

    return config
  }

  async getAllPricingConfigs(): Promise<PricingConfig[]> {
    return this.pricingConfigRepository.find({
      where: { isActive: true },
      order: { cargoType: "ASC" },
    })
  }

  async createPricingConfig(configData: Partial<PricingConfig>): Promise<PricingConfig> {
    const config = this.pricingConfigRepository.create(configData)
    return this.pricingConfigRepository.save(config)
  }

  async updatePricingConfig(id: string, updateData: Partial<PricingConfig>): Promise<PricingConfig> {
    const config = await this.pricingConfigRepository.findOne({ where: { id } })
    if (!config) {
      throw new NotFoundException(`Pricing configuration with ID ${id} not found`)
    }

    Object.assign(config, updateData)
    return this.pricingConfigRepository.save(config)
  }

  async deactivatePricingConfig(id: string): Promise<void> {
    const result = await this.pricingConfigRepository.update(id, { isActive: false })
    if (result.affected === 0) {
      throw new NotFoundException(`Pricing configuration with ID ${id} not found`)
    }
  }
}
