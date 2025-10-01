import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarrierService } from './carrier.service';
import { Carrier } from '../entities/carrier.entity';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';
import { CarrierType, CarrierStatus } from '../entities/carrier.entity';

describe('CarrierService', () => {
  let service: CarrierService;
  let carrierRepository: Repository<Carrier>;

  const mockCarrier: Carrier = {
    id: 'carrier-1',
    name: 'Test Carrier',
    description: 'Test Carrier Description',
    carrierType: CarrierType.TRUCKING_COMPANY,
    status: CarrierStatus.ACTIVE,
    website: 'https://test.com',
    contactEmail: 'test@test.com',
    contactPhone: '+1234567890',
    headquarters: 'New York',
    serviceAreas: ['US'],
    capabilities: {
      cargoTypes: ['general'],
      maxWeight: 1000,
      maxVolume: 50,
    },
    certifications: {},
    reliabilityScore: 85,
    safetyScore: 90,
    costScore: 80,
    speedScore: 75,
    metadata: {},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierService,
        {
          provide: getRepositoryToken(Carrier),
          useValue: {
            create: jest.fn().mockReturnValue(mockCarrier),
            save: jest.fn().mockResolvedValue(mockCarrier),
            find: jest.fn().mockResolvedValue([mockCarrier]),
            findOne: jest.fn().mockResolvedValue(mockCarrier),
            remove: jest.fn().mockResolvedValue(mockCarrier),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockCarrier]),
              getCount: jest.fn().mockResolvedValue(1),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<CarrierService>(CarrierService);
    carrierRepository = module.get<Repository<Carrier>>(getRepositoryToken(Carrier));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new carrier', async () => {
      const createCarrierDto: CreateCarrierDto = {
        name: 'Test Carrier',
        description: 'Test Carrier Description',
        carrierType: CarrierType.TRUCKING_COMPANY,
        website: 'https://test.com',
        contactEmail: 'test@test.com',
        contactPhone: '+1234567890',
        headquarters: 'New York',
        serviceAreas: ['US'],
        capabilities: {
          cargoTypes: ['general'],
          maxWeight: 1000,
          maxVolume: 50,
        },
        reliabilityScore: 85,
        safetyScore: 90,
        costScore: 80,
        speedScore: 75,
      };

      const result = await service.create(createCarrierDto);
      
      expect(result).toEqual(mockCarrier);
      expect(carrierRepository.create).toHaveBeenCalledWith(createCarrierDto);
      expect(carrierRepository.save).toHaveBeenCalledWith(mockCarrier);
    });
  });

  describe('findAll', () => {
    it('should return paginated carriers with filters', async () => {
      const result = await service.findAll(1, 10, {
        name: 'Test Carrier',
        carrierType: 'trucking_company',
        status: 'active',
        isActive: true,
      });

      expect(result).toEqual({
        carriers: [mockCarrier],
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should return carriers without filters', async () => {
      const result = await service.findAll();
      
      expect(result).toEqual({
        carriers: [mockCarrier],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a carrier by id', async () => {
      const result = await service.findOne('carrier-1');
      
      expect(result).toEqual(mockCarrier);
      expect(carrierRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'carrier-1' },
      });
    });

    it('should throw NotFoundException when carrier not found', async () => {
      jest.spyOn(carrierRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow('Carrier not found');
    });
  });

  describe('update', () => {
    it('should update a carrier', async () => {
      const updateCarrierDto: UpdateCarrierDto = {
        name: 'Updated Carrier',
        description: 'Updated Description',
      };

      const result = await service.update('carrier-1', updateCarrierDto);
      
      expect(result).toEqual(mockCarrier);
      expect(carrierRepository.save).toHaveBeenCalledWith(mockCarrier);
    });
  });

  describe('remove', () => {
    it('should remove a carrier', async () => {
      await service.remove('carrier-1');
      
      expect(carrierRepository.remove).toHaveBeenCalledWith(mockCarrier);
    });
  });

  describe('getCarriersByType', () => {
    it('should return carriers by type', async () => {
      const result = await service.getCarriersByType('trucking_company');
      
      expect(result).toEqual([mockCarrier]);
    });
  });

  describe('getCarriersByServiceArea', () => {
    it('should return carriers by service area', async () => {
      const result = await service.getCarriersByServiceArea('US');
      
      expect(result).toEqual([mockCarrier]);
    });
  });

  describe('searchCarriers', () => {
    it('should search carriers by term', async () => {
      const result = await service.searchCarriers('Test Carrier');
      
      expect(result).toEqual([mockCarrier]);
    });
  });

  describe('getCarrierStatistics', () => {
    it('should return carrier statistics', async () => {
      const result = await service.getCarrierStatistics();
      
      expect(result).toEqual({
        totalCarriers: 1,
        activeCarriers: 1,
        carriersByType: { trucking_company: 1 },
        averageReliabilityScore: 85,
        averageSafetyScore: 90,
        averageCostScore: 80,
        averageSpeedScore: 75,
      });
    });
  });

  describe('getTopCarriers', () => {
    it('should return top performing carriers', async () => {
      const result = await service.getTopCarriers(5);
      
      expect(result).toEqual([mockCarrier]);
    });
  });

  describe('updateCarrierScores', () => {
    it('should update carrier performance scores', async () => {
      const scores = {
        reliabilityScore: 90,
        safetyScore: 95,
        costScore: 85,
        speedScore: 80,
      };

      const result = await service.updateCarrierScores('carrier-1', scores);
      
      expect(result).toEqual(mockCarrier);
      expect(carrierRepository.save).toHaveBeenCalledWith(mockCarrier);
    });
  });
});
