import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { DataSeederService } from "../services/data-seeder.service"
import { ShipmentData } from "../entities/shipment-data.entity"
import { jest } from "@jest/globals"

describe("DataSeederService", () => {
  let service: DataSeederService
  let repository: Repository<ShipmentData>

  const mockRepository = {
    count: jest.fn(),
    save: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DataSeederService,
        {
          provide: getRepositoryToken(ShipmentData),
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<DataSeederService>(DataSeederService)
    repository = module.get<Repository<ShipmentData>>(getRepositoryToken(ShipmentData))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("seedMockData", () => {
    it("should seed data when database is empty", async () => {
      mockRepository.count.mockResolvedValue(0)
      mockRepository.save.mockResolvedValue([])

      await service.seedMockData()

      expect(mockRepository.count).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalled()
    })

    it("should skip seeding when data already exists", async () => {
      mockRepository.count.mockResolvedValue(100)

      await service.seedMockData()

      expect(mockRepository.count).toHaveBeenCalled()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })
})
