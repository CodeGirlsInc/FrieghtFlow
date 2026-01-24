import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { Carrier } from '../entities/carrier.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { CarrierRating } from '../entities/carrier-rating.entity';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { CreateRatingDto } from '../dto/create-rating.dto';

@Injectable()
export class CarrierService {
  constructor(
    @InjectRepository(Carrier)
    private carrierRepository: Repository<Carrier>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(CarrierRating)
    private ratingRepository: Repository<CarrierRating>,
  ) {}

  async create(createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    // Check if license number already exists
    const existingCarrier = await this.carrierRepository.findOne({
      where: { licenseNumber: createCarrierDto.licenseNumber },
    });

    if (existingCarrier) {
      throw new ConflictException('License number already exists');
    }

    const carrier = this.carrierRepository.create({
      ...createCarrierDto,
      serviceAreas: createCarrierDto.serviceAreas || [],
    });

    return await this.carrierRepository.save(carrier);
  }

  async findAll(): Promise<Carrier[]> {
    return await this.carrierRepository.find({
      relations: ['vehicles', 'ratings'],
    });
  }

  async findOne(id: string): Promise<Carrier> {
    const carrier = await this.carrierRepository.findOne({
      where: { id },
      relations: ['vehicles', 'ratings'],
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }

    return carrier;
  }

  async update(id: string, updateCarrierDto: UpdateCarrierDto): Promise<Carrier> {
    const carrier = await this.findOne(id);

    Object.assign(carrier, updateCarrierDto);

    // Recalculate average rating if needed
    if (updateCarrierDto.isVerified !== undefined) {
      carrier.isVerified = updateCarrierDto.isVerified;
    }

    if (updateCarrierDto.isActive !== undefined) {
      carrier.isActive = updateCarrierDto.isActive;
    }

    return await this.carrierRepository.save(carrier);
  }

  async remove(id: string): Promise<void> {
    const carrier = await this.findOne(id);

    // Check if carrier has active vehicles
    const activeVehicles = await this.vehicleRepository.count({
      where: { carrierId: id, isActive: true },
    });

    if (activeVehicles > 0) {
      throw new BadRequestException('Cannot delete carrier with active vehicles');
    }

    await this.carrierRepository.remove(carrier);
  }

  // Vehicle methods
  async createVehicle(carrierId: string, createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    // Verify carrier exists
    await this.findOne(carrierId);

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      carrierId,
    });

    return await this.vehicleRepository.save(vehicle);
  }

  async getVehiclesByCarrier(carrierId: string): Promise<Vehicle[]> {
    return await this.vehicleRepository.find({
      where: { carrierId, isActive: true },
    });
  }

  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${vehicleId} not found`);
    }

    return vehicle;
  }

  async updateVehicle(vehicleId: string, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const vehicle = await this.getVehicleById(vehicleId);

    Object.assign(vehicle, updateVehicleDto);

    return await this.vehicleRepository.save(vehicle);
  }

  async deleteVehicle(vehicleId: string): Promise<void> {
    const vehicle = await this.getVehicleById(vehicleId);
    await this.vehicleRepository.remove(vehicle);
  }

  // Rating methods
  async rateCarrier(createRatingDto: CreateRatingDto): Promise<CarrierRating> {
    // Check if carrier exists
    await this.findOne(createRatingDto.carrierId);

    // Check if user has already rated this carrier for the same job
    const existingRating = await this.ratingRepository.findOne({
      where: {
        carrierId: createRatingDto.carrierId,
        ratedBy: createRatingDto.ratedBy,
        freightJobId: createRatingDto.freightJobId,
      },
    });

    if (existingRating) {
      throw new ConflictException('Rating already exists for this job');
    }

    const rating = this.ratingRepository.create(createRatingDto);
    const savedRating = await this.ratingRepository.save(rating);

    // Update carrier's average rating
    await this.updateCarrierAverageRating(createRatingDto.carrierId);

    return savedRating;
  }

  private async updateCarrierAverageRating(carrierId: string): Promise<void> {
    const ratings = await this.ratingRepository.find({
      where: { carrierId },
    });

    if (ratings.length === 0) {
      await this.carrierRepository.update(carrierId, { averageRating: 0 });
      return;
    }

    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    const average = sum / ratings.length;

    await this.carrierRepository.update(carrierId, { 
      averageRating: parseFloat(average.toFixed(2)) 
    });
  }

  // Performance methods
  async getPerformanceMetrics(carrierId: string): Promise<any> {
    const carrier = await this.findOne(carrierId);

    // This would typically involve more complex calculations based on job completion data
    // For now, returning the stored metrics
    return {
      averageRating: carrier.averageRating,
      totalDeliveries: carrier.totalDeliveries,
      onTimePercentage: carrier.onTimePercentage,
      serviceAreas: carrier.serviceAreas,
      isActive: carrier.isActive,
      isVerified: carrier.isVerified,
    };
  }

  async updateCarrierDeliveryStats(carrierId: string, onTime: boolean): Promise<void> {
    const carrier = await this.carrierRepository.findOne({
      where: { id: carrierId },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    // Update total deliveries
    carrier.totalDeliveries += 1;

    // Update on-time percentage
    const totalDeliveries = carrier.totalDeliveries;
    let onTimeCount = carrier.onTimePercentage * (totalDeliveries - 1) / 100;

    if (onTime) {
      onTimeCount += 1;
    }

    carrier.onTimePercentage = (onTimeCount / totalDeliveries) * 100;

    await this.carrierRepository.save(carrier);
  }

  // Search and filtering methods
  async searchCarriers(filters: {
    serviceArea?: string;
    minRating?: number;
    isVerified?: boolean;
    searchTerm?: string;
  }): Promise<Carrier[]> {
    const queryBuilder = this.carrierRepository.createQueryBuilder('carrier');

    if (filters.serviceArea) {
      queryBuilder.andWhere('carrier.service_areas && :areas', { 
        areas: `{${filters.serviceArea}}` 
      });
    }

    if (filters.minRating !== undefined) {
      queryBuilder.andWhere('carrier.average_rating >= :minRating', { 
        minRating: filters.minRating 
      });
    }

    if (filters.isVerified !== undefined) {
      queryBuilder.andWhere('carrier.is_verified = :isVerified', { 
        isVerified: filters.isVerified 
      });
    }

    if (filters.searchTerm) {
      queryBuilder.andWhere(
        '(carrier.company_name ILIKE :searchTerm OR carrier.license_number ILIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` }
      );
    }

    return await queryBuilder.getMany();
  }
}