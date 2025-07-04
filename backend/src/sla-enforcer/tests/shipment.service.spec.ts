import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { ConflictException, NotFoundException } from "@nestjs/common"
import { ShipmentService } from "../services/shipment.service"
import { Shipment, ShipmentStatus, ShipmentPriority } from "../entities/shipment.entity"
import type { CreateShipmentDto } from "../dto/create-shipment.dto"
import { jest } from "@jest/globals"

describe("ShipmentService", () => {
  let service: ShipmentService
  let shipmentRepository: Repository<Shipment>

  const mockShipmentRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: mockShipmentRepository,
        },
      ],
    }).compile()

    service = module.get<ShipmentService>(ShipmentService)
    shipmentRepository = module.get<Repository<Shipment>>(getRepositoryToken(Shipment))
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("createShipment", () => {
    const createShipmentDto: CreateShipmentDto = {
      trackingNumber: "TEST001",
      customerId: "customer-1",
      origin: "New York",
      destination: "Los Angeles",
      priority: ShipmentPriority.STANDARD,
      expectedDeliveryAt: new Date().toISOString(),
    }

    it("should create a new shipment successfully", async () => {
      const mockShipment = {
        id: "shipment-1",
        ...createShipmentDto,
        status: ShipmentStatus.CREATED,
      }

      mockShipmentRepository.findOne.mockResolvedValue(null) // No existing shipment
      mockShipmentRepository.create.mockReturnValue(mockShipment)
      mockShipmentRepository.save.mockResolvedValue(mockShipment)

      const result = await service.createShipment(createShipmentDto)

      expect(result).toEqual(mockShipment)
      expect(mockShipmentRepository.findOne).toHaveBeenCalledWith({
        where: { trackingNumber: createShipmentDto.trackingNumber },
      })
    })

    it("should throw ConflictException for duplicate tracking number", async () => {
      const existingShipment = { id: "existing-shipment" }
      mockShipmentRepository.findOne.mockResolvedValue(existingShipment)

      await expect(service.createShipment(createShipmentDto)).rejects.toThrow(ConflictException)
    })
  })

  describe("updateShipmentStatus", () => {
    it("should update shipment status successfully", async () => {
      const mockShipment = {
        id: "shipment-1",
        status: ShipmentStatus.CREATED,
        pickedUpAt: null,
        actualDeliveryAt: null,
      }

      const updateDto = {
        status: ShipmentStatus.PICKED_UP,
        timestamp: new Date().toISOString(),
      }

      mockShipmentRepository.findOne.mockResolvedValue(mockShipment)
      mockShipmentRepository.save.mockResolvedValue({
        ...mockShipment,
        status: ShipmentStatus.PICKED_UP,
        pickedUpAt: new Date(updateDto.timestamp),
      })

      const result = await service.updateShipmentStatus("shipment-1", updateDto)

      expect(result.status).toBe(ShipmentStatus.PICKED_UP)
      expect(result.pickedUpAt).toBeDefined()
    })

    it("should throw NotFoundException for non-existent shipment", async () => {
      mockShipmentRepository.findOne.mockResolvedValue(null)

      await expect(service.updateShipmentStatus("non-existent", { status: ShipmentStatus.DELIVERED })).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe("createTestShipments", () => {
    it("should create test shipments for SLA testing", async () => {
      const mockShipments = [
        { id: "test-1", trackingNumber: "TEST001" },
        { id: "test-2", trackingNumber: "TEST002" },
        { id: "test-3", trackingNumber: "TEST003" },
      ]

      mockShipmentRepository.findOne.mockResolvedValue(null) // No existing shipments
      mockShipmentRepository.create.mockImplementation((dto) => ({ ...dto, id: "new-id" }))
      mockShipmentRepository.save.mockImplementation((shipment) => Promise.resolve(shipment))

      const result = await service.createTestShipments()

      expect(result).toHaveLength(3)
      expect(mockShipmentRepository.save).toHaveBeenCalledTimes(3)
    })
  })
})
