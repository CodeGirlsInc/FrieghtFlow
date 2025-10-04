import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from './entities/cargo.entity';
import { Shipment } from 'src/shipment';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';

@Injectable()
export class CargoService {
  constructor(
    @InjectRepository(Cargo)
    private cargoRepository: Repository<Cargo>,
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
  ) {}

  async create(createCargoDto: CreateCargoDto): Promise<Cargo> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: createCargoDto.shipmentId },
    });

    if (!shipment) {
      throw new BadRequestException(
        `Shipment with ID ${createCargoDto.shipmentId} not found`,
      );
    }

    const cargo = this.cargoRepository.create(createCargoDto);
    return await this.cargoRepository.save(cargo);
  }

  async findAll(): Promise<Cargo[]> {
    return await this.cargoRepository.find({
      relations: ['shipment'],
    });
  }

  async findOne(id: string): Promise<Cargo> {
    const cargo = await this.cargoRepository.findOne({
      where: { id },
      relations: ['shipment'],
    });

    if (!cargo) {
      throw new NotFoundException(`Cargo with ID ${id} not found`);
    }

    return cargo;
  }

  async findByShipmentId(shipmentId: string): Promise<Cargo[]> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipmentId} not found`);
    }

    return await this.cargoRepository.find({
      where: { shipmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateCargoDto: UpdateCargoDto): Promise<Cargo> {
    const cargo = await this.findOne(id);
    Object.assign(cargo, updateCargoDto);
    return await this.cargoRepository.save(cargo);
  }

  async remove(id: string): Promise<void> {
    const cargo = await this.findOne(id);
    await this.cargoRepository.remove(cargo);
  }
}