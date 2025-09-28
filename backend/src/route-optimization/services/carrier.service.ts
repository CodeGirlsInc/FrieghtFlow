import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrier } from '../entities/carrier.entity';
import { CreateCarrierDto } from '../dto/create-carrier.dto';
import { UpdateCarrierDto } from '../dto/update-carrier.dto';

@Injectable()
export class CarrierService {
  constructor(
    @InjectRepository(Carrier)
    private carrierRepository: Repository<Carrier>,
  ) {}

  async create(createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    const carrier = this.carrierRepository.create(createCarrierDto);
    return await this.carrierRepository.save(carrier);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      name?: string;
      carrierType?: string;
      status?: string;
      isActive?: boolean;
    }
  ): Promise<{ carriers: Carrier[]; total: number; page: number; limit: number }> {
    const query = this.carrierRepository
      .createQueryBuilder('carrier')
      .orderBy('carrier.createdAt', 'DESC');

    // Apply filters
    if (filters?.name) {
      query.andWhere('carrier.name ILIKE :name', { name: `%${filters.name}%` });
    }

    if (filters?.carrierType) {
      query.andWhere('carrier.carrierType = :carrierType', { carrierType: filters.carrierType });
    }

    if (filters?.status) {
      query.andWhere('carrier.status = :status', { status: filters.status });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('carrier.isActive = :isActive', { isActive: filters.isActive });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const carriers = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      carriers,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Carrier> {
    const carrier = await this.carrierRepository.findOne({
      where: { id },
    });

    if (!carrier) {
      throw new NotFoundException('Carrier not found');
    }

    return carrier;
  }

  async update(id: string, updateCarrierDto: UpdateCarrierDto): Promise<Carrier> {
    const carrier = await this.findOne(id);
    
    Object.assign(carrier, updateCarrierDto);
    return await this.carrierRepository.save(carrier);
  }

  async remove(id: string): Promise<void> {
    const carrier = await this.findOne(id);
    await this.carrierRepository.remove(carrier);
  }

  async getCarriersByType(carrierType: string): Promise<Carrier[]> {
    return await this.carrierRepository.find({
      where: {
        carrierType: carrierType as any,
        isActive: true,
        status: 'active',
      },
      order: { reliabilityScore: 'DESC' },
    });
  }

  async getCarriersByServiceArea(serviceArea: string): Promise<Carrier[]> {
    return await this.carrierRepository
      .createQueryBuilder('carrier')
      .where('carrier.isActive = :isActive', { isActive: true })
      .andWhere('carrier.status = :status', { status: 'active' })
      .andWhere('JSON_CONTAINS(carrier.serviceAreas, :serviceArea)', { serviceArea: `"${serviceArea}"` })
      .orderBy('carrier.reliabilityScore', 'DESC')
      .getMany();
  }

  async searchCarriers(searchTerm: string): Promise<Carrier[]> {
    return await this.carrierRepository
      .createQueryBuilder('carrier')
      .where('carrier.name ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('carrier.description ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .orWhere('carrier.headquarters ILIKE :searchTerm', { searchTerm: `%${searchTerm}%` })
      .andWhere('carrier.isActive = :isActive', { isActive: true })
      .orderBy('carrier.reliabilityScore', 'DESC')
      .getMany();
  }

  async getCarrierStatistics(): Promise<{
    totalCarriers: number;
    activeCarriers: number;
    carriersByType: Record<string, number>;
    averageReliabilityScore: number;
    averageSafetyScore: number;
    averageCostScore: number;
    averageSpeedScore: number;
  }> {
    const carriers = await this.carrierRepository.find({
      where: { isActive: true },
    });

    const totalCarriers = carriers.length;
    const activeCarriers = carriers.filter(c => c.status === 'active').length;
    
    const carriersByType = carriers.reduce((acc, carrier) => {
      acc[carrier.carrierType] = (acc[carrier.carrierType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageReliabilityScore = carriers.reduce((sum, carrier) => sum + carrier.reliabilityScore, 0) / totalCarriers;
    const averageSafetyScore = carriers.reduce((sum, carrier) => sum + carrier.safetyScore, 0) / totalCarriers;
    const averageCostScore = carriers.reduce((sum, carrier) => sum + carrier.costScore, 0) / totalCarriers;
    const averageSpeedScore = carriers.reduce((sum, carrier) => sum + carrier.speedScore, 0) / totalCarriers;

    return {
      totalCarriers,
      activeCarriers,
      carriersByType,
      averageReliabilityScore,
      averageSafetyScore,
      averageCostScore,
      averageSpeedScore,
    };
  }

  async getTopCarriers(limit: number = 10): Promise<Carrier[]> {
    return await this.carrierRepository.find({
      where: {
        isActive: true,
        status: 'active',
      },
      order: {
        reliabilityScore: 'DESC',
        safetyScore: 'DESC',
      },
      take: limit,
    });
  }

  async updateCarrierScores(
    id: string,
    scores: {
      reliabilityScore?: number;
      safetyScore?: number;
      costScore?: number;
      speedScore?: number;
    }
  ): Promise<Carrier> {
    const carrier = await this.findOne(id);
    
    Object.assign(carrier, scores);
    return await this.carrierRepository.save(carrier);
  }
}
