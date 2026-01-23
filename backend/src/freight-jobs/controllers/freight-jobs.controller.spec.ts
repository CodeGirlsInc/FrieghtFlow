import { Test, TestingModule } from '@nestjs/testing';
import { FreightJobsController } from './freight-jobs.controller';
import { FreightJobsService } from '../services/freight-jobs.service';
import { FreightJob, FreightJobStatus, Address } from '../entities/freight-job.entity';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('FreightJobsController', () => {
  let controller: FreightJobsController;
  let service: FreightJobsService;

  const mockAddress: Address = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  };

  const mockFreightJobResponse = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    shipperId: '550e8400-e29b-41d4-a716-446655440001',
    carrierId: null,
    title: 'Test Shipment',
    description: 'Test shipment description',
    originAddress: mockAddress,
    destinationAddress: mockAddress,
    cargoType: 'general',
    cargoWeight: 100,
    estimatedCost: 500,
    status: FreightJobStatus.DRAFT,
    pickupDate: new Date('2026-02-01'),
    deliveryDate: new Date('2026-02-05'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRequest = {
    user: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      role: 'shipper',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FreightJobsController],
      providers: [
        {
          provide: FreightJobsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByShipperId: jest.fn(),
            findByCarrierId: jest.fn(),
            update: jest.fn(),
            assignCarrier: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FreightJobsController>(FreightJobsController);
    service = module.get<FreightJobsService>(FreightJobsService);
  });

  describe('create', () => {
    it('should create a new freight job', async () => {
      const createDto = {
        title: 'Test Job',
        description: 'Test Description',
        originAddress: mockAddress,
        destinationAddress: mockAddress,
        cargoType: 'general',
        cargoWeight: 100,
        pickupDate: '2026-02-01T00:00:00Z',
        deliveryDate: '2026-02-05T00:00:00Z',
      };

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(mockFreightJobResponse);

      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(mockFreightJobResponse);
      expect(service.create).toHaveBeenCalledWith(
        createDto,
        mockRequest.user.id,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated freight jobs', async () => {
      const paginatedResponse = {
        data: [mockFreightJobResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(paginatedResponse);

      const result = await controller.findAll({ page: 1, limit: 10 });

      expect(result).toEqual(paginatedResponse);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single freight job', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockResolvedValue(mockFreightJobResponse);

      const result = await controller.findOne(mockFreightJobResponse.id);

      expect(result).toEqual(mockFreightJobResponse);
      expect(service.findOne).toHaveBeenCalledWith(mockFreightJobResponse.id);
    });

    it('should throw NotFoundException if job not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByShipperId', () => {
    it('should return shipper jobs', async () => {
      const paginatedResponse = {
        data: [mockFreightJobResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      jest
        .spyOn(service, 'findByShipperId')
        .mockResolvedValue(paginatedResponse);

      const result = await controller.findByShipperId(
        mockFreightJobResponse.shipperId,
        { page: 1, limit: 10 },
      );

      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('findByCarrierId', () => {
    it('should return carrier jobs', async () => {
      const paginatedResponse = {
        data: [mockFreightJobResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      jest
        .spyOn(service, 'findByCarrierId')
        .mockResolvedValue(paginatedResponse);

      const result = await controller.findByCarrierId('carrier-id', {
        page: 1,
        limit: 10,
      });

      expect(result).toEqual(paginatedResponse);
    });
  });

  describe('update', () => {
    it('should update a freight job', async () => {
      const updateDto = {
        title: 'Updated Title',
      };

      const updatedJob = { ...mockFreightJobResponse, title: 'Updated Title' };

      jest.spyOn(service, 'update').mockResolvedValue(updatedJob);

      const result = await controller.update(
        mockFreightJobResponse.id,
        updateDto,
        mockRequest,
      );

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('assignCarrier', () => {
    it('should assign a carrier to a job', async () => {
      const assignDto = {
        carrierId: '550e8400-e29b-41d4-a716-446655440002',
      };

      const assignedJob = {
        ...mockFreightJobResponse,
        carrierId: assignDto.carrierId,
        status: FreightJobStatus.ASSIGNED,
      };

      jest.spyOn(service, 'assignCarrier').mockResolvedValue(assignedJob);

      const result = await controller.assignCarrier(
        mockFreightJobResponse.id,
        assignDto,
        mockRequest,
      );

      expect(result.carrierId).toBe(assignDto.carrierId);
      expect(result.status).toBe(FreightJobStatus.ASSIGNED);
    });
  });

  describe('remove', () => {
    it('should delete a freight job', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(
        controller.remove(mockFreightJobResponse.id, mockRequest),
      ).resolves.not.toThrow();

      expect(service.remove).toHaveBeenCalledWith(
        mockFreightJobResponse.id,
        mockRequest.user.id,
        mockRequest.user.role,
      );
    });

    it('should throw ForbiddenException if not authorized', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new ForbiddenException());

      await expect(
        controller.remove(mockFreightJobResponse.id, mockRequest),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
