import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotFoundException } from "@nestjs/common"
import { PricingService } from "./pricing.service"
import { PricingConfig } from "../entities/pricing-config.entity"
import { CargoType } from "../entities/freight-quote.entity"
import { jest } from "@jest/globals"

describe("PricingService", () => {
  let service: PricingService
  let repository: Repository<PricingConfig>

  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: getRepositoryToken(PricingConfig),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<PricingService>(PricingService)
    repository = module.get<Repository<PricingConfig>>(getRepositoryToken(PricingConfig))

    jest.clearAllMocks()
  })

  describe("calculatePrice", () => {
    const mockConfig = {
      id: "config-123",
      cargoType: CargoType.GENERAL,
      baseRatePerKg: 2.5,
      distanceMultiplier: 0.0015,
      cargoTypeMultiplier: 1.0,
      minimumCharge: 25.0,
      isActive: true,
    }

    const pricingInput = {
      cargoType: CargoType.GENERAL,
      weight: 100,
      distance: 1000,
    }

    beforeEach(() => {
      mockRepository.findOne.mockResolvedValue(mockConfig)
    })

    it("should calculate price correctly", async () => {
      const result = await service.calculatePrice(pricingInput)

      const expectedBasePrice = 2.5 * 100 // 250
      const expectedDistanceCharge = 250 * 0.0015 * 1000 // 375
      const expectedTotalPrice = (250 + 375) * 1.0 // 625
      const expectedFinalPrice = Math.max(625, 25) // 625

      expect(result).toEqual({
        basePrice: expectedBasePrice,
        distanceCharge: expectedDistanceCharge,
        cargoTypeMultiplier: 1.0,
        totalPrice: expectedTotalPrice,
        minimumCharge: 25.0,
        finalPrice: expectedFinalPrice,
      })
    })

    it("should apply minimum charge when calculated price is below minimum", async () => {
      const lowPriceConfig = {
        ...mockConfig,
        baseRatePerKg: 0.1,
        distanceMultiplier: 0.0001,
        minimumCharge: 50.0,
      }
      mockRepository.findOne.mockResolvedValue(lowPriceConfig)

      const result = await service.calculatePrice({
        cargoType: CargoType.GENERAL,
        weight: 10,
        distance: 100,
      })

      expect(result.finalPrice).toBe(50.0)
      expect(result.minimumCharge).toBe(50.0)
    })

    it("should apply cargo type multiplier correctly", async () => {
      const hazardousConfig = {
        ...mockConfig,
        cargoType: CargoType.HAZARDOUS,
        cargoTypeMultiplier: 1.8,
      }
      mockRepository.findOne.mockResolvedValue(hazardousConfig)

      const result = await service.calculatePrice({
        cargoType: CargoType.HAZARDOUS,
        weight: 100,
        distance: 1000,
      })

      const basePrice = 2.5 * 100 // 250
      const distanceCharge = 250 * 0.0015 * 1000 // 375
      const expectedTotalPrice = (250 + 375) * 1.8 // 1125

      expect(result.totalPrice).toBe(expectedTotalPrice)
      expect(result.cargoTypeMultiplier).toBe(1.8)
    })

    it("should throw NotFoundException when no active config found", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.calculatePrice(pricingInput)).rejects.toThrow(NotFoundException)
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cargoType: CargoType.GENERAL, isActive: true },
      })
    })
  })

  describe("getPricingConfig", () => {
    const mockConfig = {
      id: "config-123",
      cargoType: CargoType.GENERAL,
      baseRatePerKg: 2.5,
      isActive: true,
    }

    it("should return active pricing config", async () => {
      mockRepository.findOne.mockResolvedValue(mockConfig)

      const result = await service.getPricingConfig(CargoType.GENERAL)

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cargoType: CargoType.GENERAL, isActive: true },
      })
      expect(result).toEqual(mockConfig)
    })

    it("should throw NotFoundException when config not found", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.getPricingConfig(CargoType.GENERAL)).rejects.toThrow(NotFoundException)
    })
  })

  describe("createPricingConfig", () => {
    const configData = {
      cargoType: CargoType.GENERAL,
      baseRatePerKg: 2.5,
      distanceMultiplier: 0.0015,
      cargoTypeMultiplier: 1.0,
      minimumCharge: 25.0,
    }

    it("should create and save pricing config", async () => {
      const mockCreatedConfig = { id: "config-123", ...configData }
      mockRepository.create.mockReturnValue(mockCreatedConfig)
      mockRepository.save.mockResolvedValue(mockCreatedConfig)

      const result = await service.createPricingConfig(configData)

      expect(mockRepository.create).toHaveBeenCalledWith(configData)
      expect(mockRepository.save).toHaveBeenCalledWith(mockCreatedConfig)
      expect(result).toEqual(mockCreatedConfig)
    })
  })

  describe("updatePricingConfig", () => {
    const configId = "config-123"
    const mockExistingConfig = {
      id: configId,
      cargoType: CargoType.GENERAL,
      baseRatePerKg: 2.5,
    }
    const updateData = { baseRatePerKg: 3.0 }

    it("should update existing pricing config", async () => {
      const updatedConfig = { ...mockExistingConfig, ...updateData }
      mockRepository.findOne.mockResolvedValue(mockExistingConfig)
      mockRepository.save.mockResolvedValue(updatedConfig)

      const result = await service.updatePricingConfig(configId, updateData)

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: configId } })
      expect(mockRepository.save).toHaveBeenCalledWith(updatedConfig)
      expect(result).toEqual(updatedConfig)
    })

    it("should throw NotFoundException when config not found", async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.updatePricingConfig(configId, updateData)).rejects.toThrow(NotFoundException)
    })
  })

  describe("deactivatePricingConfig", () => {
    const configId = "config-123"

    it("should deactivate pricing config", async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 })

      await service.deactivatePricingConfig(configId)

      expect(mockRepository.update).toHaveBeenCalledWith(configId, { isActive: false })
    })

    it("should throw NotFoundException when config not found", async () => {
      mockRepository.update.mockResolvedValue({ affected: 0 })

      await expect(service.deactivatePricingConfig(configId)).rejects.toThrow(NotFoundException)
    })
  })
})
