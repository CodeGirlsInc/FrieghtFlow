import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FreightJobsService } from './freight-jobs.service';
import { CostCalculationService } from './cost-calculation.service';
import { FreightJob, FreightJobStatus, Address } from '../entities/freight-job.entity';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';

describe('FreightJobsService', () => {
  let service: FreightJobsService;
  let repository: Repository<FreightJob>;
  let costCalculationService: CostCalculationService;

  const mockAddress: Address = {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
  };

  const mockFreightJob: FreightJob = {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FreightJobsService,
        CostCalculationService,
        {
          provide: getRepositoryToken(FreightJob),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            softDelete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FreightJobsService>(FreightJobsService);
    repository = module.get<Repository<FreightJob>>(
      getRepositoryToken(FreightJob),
    );
    costCalculationService = module.get<CostCalculationService>(
      CostCalculationService,
    );
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

      jest.spyOn(repository, 'create').mockReturnValue(mockFreightJob);
      jest.spyOn(repository, 'save').mockResolvedValue(mockFreightJob);

      const result = await service.create(createDto, mockFreightJob.shipperId);

      expect(result).toBeDefined();
      expect(result.status).toBe(FreightJobStatus.DRAFT);
    });

    it('should throw error if delivery date is before pickup date', async () => {
      const createDto = {
        title: 'Test Job',
        description: 'Test Description',
        originAddress: mockAddress,
        destinationAddress: mockAddress,
        cargoType: 'general',
        cargoWeight: 100,
        pickupDate: '2026-02-05T00:00:00Z',
        deliveryDate: '2026-02-01T00:00:00Z',
      };

      await expect(
        service.create(createDto, mockFreightJob.shipperId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a freight job by ID', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFreightJob);

      const result = await service.findOne(mockFreightJob.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockFreightJob.id);
    });

    it('should throw NotFoundException if job not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a freight job', async () => {
      const updateDto = {
        title: 'Updated Title',
      };

      const updatedJob = { ...mockFreightJob, title: 'Updated Title' };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFreightJob);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedJob);

      const result = await service.update(
        mockFreightJob.id,
        updateDto,
        mockFreightJob.shipperId,
        'shipper',
      );

      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenException if not authorized', async () => {
      const updateDto = {
        title: 'Updated Title',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFreightJob);

      await expect(
        service.update(
          mockFreightJob.id,
          updateDto,
          'different-user-id',
          'shipper',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw error for invalid status transition', async () => {
      const updateDto = {
        status: FreightJobStatus.DELIVERED,
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFreightJob);

      await expect(
        service.update(
          mockFreightJob.id,
          updateDto,
          mockFreightJob.shipperId,
          'shipper',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignCarrier', () => {
    it('should assign a carrier to a posted job', async () => {
      const postedJob = { ...mockFreightJob, status: FreightJobStatus.POSTED };
      const assignDto = {
        carrierId: '550e8400-e29b-41d4-a716-446655440002',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(postedJob);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({
          ...postedJob,
          carrierId: assignDto.carrierId,
          status: FreightJobStatus.ASSIGNED,
        });

      const result = await service.assignCarrier(
        postedJob.id,
        assignDto,
        postedJob.shipperId,
        'shipper',
      );

      expect(result.carrierId).toBe(assignDto.carrierId);
      expect(result.status).toBe(FreightJobStatus.ASSIGNED);
    });

    it('should throw error if job is not in POSTED status', async () => {
      const assignDto = {
        carrierId: '550e8400-e29b-41d4-a716-446655440002',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFreightJob);

      await expect(
        service.assignCarrier(
          mockFreightJob.id,
          assignDto,
          mockFreightJob.shipperId,
          'shipper',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete a job in DRAFT status', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFreightJob);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({ affected: 1 } as any);

      await expect(
        service.remove(
          mockFreightJob.id,
          mockFreightJob.shipperId,
          'shipper',
        ),
      ).resolves.not.toThrow();

      expect(repository.softDelete).toHaveBeenCalledWith(mockFreightJob.id);
    });

    it('should throw error if job not in DRAFT status', async () => {
      const postedJob = { ...mockFreightJob, status: FreightJobStatus.POSTED };

      jest.spyOn(repository, 'findOne').mockResolvedValue(postedJob);

      await expect(
        service.remove(postedJob.id, postedJob.shipperId, 'shipper'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if not authorized', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockFreightJob);

      await expect(
        service.remove(mockFreightJob.id, 'different-user-id', 'shipper'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Status Transitions', () => {
    it('should allow DRAFT to POSTED transition', async () => {
      const draftJob = { ...mockFreightJob, status: FreightJobStatus.DRAFT };
      const updateDto = { status: FreightJobStatus.POSTED };

      jest.spyOn(repository, 'findOne').mockResolvedValue(draftJob);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...draftJob, status: FreightJobStatus.POSTED });

      const result = await service.update(
        draftJob.id,
        updateDto,
        draftJob.shipperId,
        'shipper',
      );

      expect(result.status).toBe(FreightJobStatus.POSTED);
    });

    it('should allow POSTED to ASSIGNED transition', async () => {
      const postedJob = { ...mockFreightJob, status: FreightJobStatus.POSTED };
      const updateDto = { status: FreightJobStatus.ASSIGNED };

      jest.spyOn(repository, 'findOne').mockResolvedValue(postedJob);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ ...postedJob, status: FreightJobStatus.ASSIGNED });

      const result = await service.update(
        postedJob.id,
        updateDto,
        postedJob.shipperId,
        'shipper',
      );

      expect(result.status).toBe(FreightJobStatus.ASSIGNED);
    });

    it('should allow ASSIGNED to IN_TRANSIT transition', async () => {
      const assignedJob = {
        ...mockFreightJob,
        status: FreightJobStatus.ASSIGNED,
      };
      const updateDto = { status: FreightJobStatus.IN_TRANSIT };

      jest.spyOn(repository, 'findOne').mockResolvedValue(assignedJob);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({
          ...assignedJob,
          status: FreightJobStatus.IN_TRANSIT,
        });

      const result = await service.update(
        assignedJob.id,
        updateDto,
        assignedJob.shipperId,
        'shipper',
      );

      expect(result.status).toBe(FreightJobStatus.IN_TRANSIT);
    });

    it('should allow IN_TRANSIT to DELIVERED transition', async () => {
      const inTransitJob = {
        ...mockFreightJob,
        status: FreightJobStatus.IN_TRANSIT,
      };
      const updateDto = { status: FreightJobStatus.DELIVERED };

      jest.spyOn(repository, 'findOne').mockResolvedValue(inTransitJob);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({
          ...inTransitJob,
          status: FreightJobStatus.DELIVERED,
        });

      const result = await service.update(
        inTransitJob.id,
        updateDto,
        inTransitJob.shipperId,
        'shipper',
      );

      expect(result.status).toBe(FreightJobStatus.DELIVERED);
    });
  });
});
