import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrier } from '../entities/carrier.entity';
import { CreateCarrierDto } from '../dto/create-carrier.dto';

@Injectable()
export class CarrierService {
  constructor(
    @InjectRepository(Carrier)
    private carrierRepository: Repository<Carrier>,
  ) {}

  async create(createCarrierDto: CreateCarrierDto): Promise<Carrier> {
    const existingCarrier = await this.carrierRepository.findOne({
      where: { email: createCarrierDto.email }
    });

    if (existingCarrier) {
      throw new ConflictException('Carrier with this email already exists');
    }

    const carrier = this.carrierRepository.create(createCarrierDto);
    return this.carrierRepository.save(carrier);
  }

  async findAll(): Promise<Carrier[]> {
    return this.carrierRepository.find({
      relations: ['vehicles'],
    });
  }

  async findOne(id: string): Promise<Carrier> {
    const carrier = await this.carrierRepository.findOne({
      where: { id },
      relations: ['vehicles'],
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${id} not found`);
    }

    return carrier;
  }

  async update(id: string, updateCarrierDto: Partial<CreateCarrierDto>): Promise<Carrier> {
    const carrier = await this.findOne(id);
    Object.assign(carrier, updateCarrierDto);
    return this.carrierRepository.save(carrier);
  }

  async remove(id: string): Promise<void> {
    const carrier = await this.findOne(id);
    carrier.isActive = false;
    await this.carrierRepository.save(carrier);
  }
}
