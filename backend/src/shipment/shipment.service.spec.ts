import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShipmentService } from "./shipment.service";
import { Shipment, ShipmentStatus } from "./shipment.entity";
import { ShipmentStatusHistory } from "./shipment-status-history.entity";
import { CreateShipmentDto } from "./dto/create-shipment.dto";
import { UpdateShipmentStatusDto } from "./dto/update-shipment-status.dto";
import { NotFoundException, BadRequestException } from "@nestjs/common";

describe("ShipmentService", () => {
  let service: ShipmentService;
  let shipmentRepo: Repository<Shipment>;
  let statusHistoryRepo: Repository<ShipmentStatusHistory>;

  const mockShipment = {
    id: "test-id",
    trackingId: "FF-20241201-ABC12",
    origin: "New York",
    destination: "Los Angeles",
    carrier: "FedEx",
    status: ShipmentStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockStatusHistory = {
    id: "history-id",
    shipmentId: "test-id",
    status: ShipmentStatus.PENDING,
    timestamp: new Date(),
    description: "Shipment created",
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentService,
        {
          provide: getRepositoryToken(Shipment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(ShipmentStatusHistory),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ShipmentService>(ShipmentService);
    shipmentRepo = module.get<Repository<Shipment>>(getRepositoryToken(Shipment));
    statusHistoryRepo = module.get<Repository<ShipmentStatusHistory>>(getRepositoryToken(ShipmentStatusHistory));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a shipment with tracking ID", async () => {
      const createDto: CreateShipmentDto = {
        origin: "New York",
        destination: "Los Angeles",
        carrier: "FedEx",
      };

      const mockCreatedShipment = { ...mockShipment, ...createDto };
      jest.spyOn(shipmentRepo, "create").mockReturnValue(mockCreatedShipment as any);
      jest.spyOn(shipmentRepo, "save").mockResolvedValue(mockCreatedShipment as any);
      jest.spyOn(statusHistoryRepo, "save").mockResolvedValue(mockStatusHistory as any);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCreatedShipment);
      expect(result.trackingId).toMatch(/^FF-\d{8}-[A-Z0-9]{5}$/);
      expect(statusHistoryRepo.save).toHaveBeenCalledWith({
        shipmentId: mockCreatedShipment.id,
        status: ShipmentStatus.PENDING,
        description: "Shipment created",
      });
    });

    it("should create shipment with estimated delivery date", async () => {
      const createDto: CreateShipmentDto = {
        origin: "New York",
        destination: "Los Angeles",
        carrier: "FedEx",
        estimatedDelivery: "2024-12-25T00:00:00.000Z",
      };

      const mockCreatedShipment = { ...mockShipment, ...createDto };
      jest.spyOn(shipmentRepo, "create").mockReturnValue(mockCreatedShipment as any);
      jest.spyOn(shipmentRepo, "save").mockResolvedValue(mockCreatedShipment as any);
      jest.spyOn(statusHistoryRepo, "save").mockResolvedValue(mockStatusHistory as any);

      const result = await service.create(createDto);

      expect(result.estimatedDelivery).toEqual(new Date(createDto.estimatedDelivery));
    });
  });

  describe("findAll", () => {
    it("should return all shipments with status history", async () => {
      const mockShipments = [mockShipment];
      jest.spyOn(shipmentRepo, "find").mockResolvedValue(mockShipments as any);

      const result = await service.findAll();

      expect(result).toEqual(mockShipments);
      expect(shipmentRepo.find).toHaveBeenCalledWith({
        order: { createdAt: "DESC" },
        relations: ["statusHistory"],
      });
    });
  });

  describe("findOne", () => {
    it("should return a shipment by ID", async () => {
      jest.spyOn(shipmentRepo, "findOne").mockResolvedValue(mockShipment as any);

      const result = await service.findOne("test-id");

      expect(result).toEqual(mockShipment);
      expect(shipmentRepo.findOne).toHaveBeenCalledWith({
        where: { id: "test-id" },
        relations: ["statusHistory"],
      });
    });

    it("should throw NotFoundException when shipment not found", async () => {
      jest.spyOn(shipmentRepo, "findOne").mockResolvedValue(null);

      await expect(service.findOne("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByTrackingId", () => {
    it("should return a shipment by tracking ID", async () => {
      jest.spyOn(shipmentRepo, "findOne").mockResolvedValue(mockShipment as any);

      const result = await service.findByTrackingId("FF-20241201-ABC12");

      expect(result).toEqual(mockShipment);
      expect(shipmentRepo.findOne).toHaveBeenCalledWith({
        where: { trackingId: "FF-20241201-ABC12" },
        relations: ["statusHistory"],
      });
    });

    it("should throw NotFoundException when tracking ID not found", async () => {
      jest.spyOn(shipmentRepo, "findOne").mockResolvedValue(null);

      await expect(service.findByTrackingId("non-existent")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateStatus", () => {
    it("should update shipment status and create history entry", async () => {
      const updateStatusDto: UpdateShipmentStatusDto = {
        status: ShipmentStatus.IN_TRANSIT,
        location: "Chicago",
        description: "Package in transit",
      };

      const mockShipmentToUpdate = { ...mockShipment, status: ShipmentStatus.PENDING };
      const mockUpdatedShipment = { ...mockShipmentToUpdate, status: ShipmentStatus.IN_TRANSIT };

      jest.spyOn(service, "findOne").mockResolvedValue(mockShipmentToUpdate as any);
      jest.spyOn(shipmentRepo, "save").mockResolvedValue(mockUpdatedShipment as any);
      jest.spyOn(statusHistoryRepo, "save").mockResolvedValue(mockStatusHistory as any);

      const result = await service.updateStatus("test-id", updateStatusDto);

      expect(result.status).toBe(ShipmentStatus.IN_TRANSIT);
      expect(statusHistoryRepo.save).toHaveBeenCalledWith({
        shipmentId: "test-id",
        status: ShipmentStatus.IN_TRANSIT,
        location: "Chicago",
        description: "Package in transit",
      });
    });

    it("should throw BadRequestException when updating delivered shipment", async () => {
      const updateStatusDto: UpdateShipmentStatusDto = {
        status: ShipmentStatus.IN_TRANSIT,
      };

      const mockDeliveredShipment = { ...mockShipment, status: ShipmentStatus.DELIVERED };
      jest.spyOn(service, "findOne").mockResolvedValue(mockDeliveredShipment as any);

      await expect(service.updateStatus("test-id", updateStatusDto)).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when updating cancelled shipment", async () => {
      const updateStatusDto: UpdateShipmentStatusDto = {
        status: ShipmentStatus.IN_TRANSIT,
      };

      const mockCancelledShipment = { ...mockShipment, status: ShipmentStatus.CANCELLED };
      jest.spyOn(service, "findOne").mockResolvedValue(mockCancelledShipment as any);

      await expect(service.updateStatus("test-id", updateStatusDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe("getStatusHistory", () => {
    it("should return sorted status history", async () => {
      const mockHistory = [
        { ...mockStatusHistory, timestamp: new Date("2024-12-01") },
        { ...mockStatusHistory, timestamp: new Date("2024-12-02") },
      ];

      const mockShipmentWithHistory = { ...mockShipment, statusHistory: mockHistory };
      jest.spyOn(service, "findOne").mockResolvedValue(mockShipmentWithHistory as any);

      const result = await service.getStatusHistory("test-id");

      expect(result).toHaveLength(2);
      expect(result[0].timestamp).toEqual(new Date("2024-12-02"));
      expect(result[1].timestamp).toEqual(new Date("2024-12-01"));
    });
  });

  describe("searchShipments", () => {
    it("should search shipments by query", async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockShipment]),
      };

      jest.spyOn(shipmentRepo, "createQueryBuilder").mockReturnValue(mockQueryBuilder as any);

      const result = await service.searchShipments("FedEx");

      expect(result).toEqual([mockShipment]);
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });
  });
});
