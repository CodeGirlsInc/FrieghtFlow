import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarrierService } from './services/carrier.service';
import { Carrier } from './entities/carrier.entity';
import { Vehicle } from './entities/vehicle.entity';
import { CarrierRating } from './entities/carrier-rating.entity';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('CarrierService', () => {
  let service: CarrierService;
  let carrierRepository: Repository<Carrier>;
  let vehicleRepository: Repository<Vehicle>;
  let ratingRepository: Repository<CarrierRating>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarrierService,
        {
          provide: getRepositoryToken(Carrier),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(CarrierRating),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CarrierService>(CarrierService);
    carrierRepository = module.get<Repository<Carrier>>(getRepositoryToken(Carrier));
    vehicleRepository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
    ratingRepository = module.get<Repository<CarrierRating>>(getRepositoryToken(CarrierRating));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new carrier', async () => {
      const createCarrierDto: CreateCarrierDto = {
        userId: 'user-id',
        companyName: 'Test Carrier',
        licenseNumber: 'TEST123',
        insurancePolicy: 'policy-123',
        serviceAreas: ['area1', 'area2'],
      };

      jest.spyOn(carrierRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(carrierRepository, 'create').mockReturnValue(new Carrier());
      jest.spyOn(carrierRepository, 'save').mockResolvedValue({
        id: 'carrier-id',
        ...createCarrierDto,
        serviceAreas: createCarrierDto.serviceAreas,
        averageRating: 0,
        totalDeliveries: 0,
        onTimePercentage: 0,
        isVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        vehicles: [],
        ratings: [],
      } as Carrier);

      const result = await service.create(createCarrierDto);
      
      expect(result).toBeDefined();
      expect(result.companyName).toBe('Test Carrier');
    });

    it('should throw ConflictException if license number already exists', async () => {
      const createCarrierDto: CreateCarrierDto = {
        userId: 'user-id',
        companyName: 'Test Carrier',
        licenseNumber: 'TEST123',
        insurancePolicy: 'policy-123',
      };

      jest.spyOn(carrierRepository, 'findOne').mockResolvedValue(new Carrier());

      await expect(service.create(createCarrierDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a carrier if found', async () => {
      const carrier = new Carrier();
      carrier.id = 'carrier-id';
      carrier.companyName = 'Test Carrier';

      jest.spyOn(carrierRepository, 'findOne').mockResolvedValue(carrier);

      const result = await service.findOne('carrier-id');
      
      expect(result).toEqual(carrier);
    });

    it('should throw NotFoundException if carrier not found', async () => {
      jest.spyOn(carrierRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('carrier-id')).rejects.toThrow(NotFoundException);
    });
  });
});