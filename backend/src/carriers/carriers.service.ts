import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrier } from './entities/carrier.entity';
import { CreateCarrierDto } from './dto/create-carrier.dto';
import { UpdateCarrierDto } from './dto/update-carrier.dto';
import { AssignCarrierDto } from './dto/assign-carrier.dto';
import { Shipment } from '../shipments/entities/shipment.entity';

@Injectable()
export class CarriersService {
  constructor(
    @InjectRepository(Carrier)
    private carriersRepo: Repository<Carrier>,
    @InjectRepository(Shipment)
    private shipmentsRepo: Repository<Shipment>,
  ) {}

  async create(dto: CreateCarrierDto): Promise<Carrier> {
    const carrier = this.carriersRepo.create(dto);
    return this.carriersRepo.save(carrier);
  }

  async findAll(): Promise<Carrier[]> {
    return this.carriersRepo.find({ relations: ['shipments'] });
  }

  async findOne(id: string): Promise<Carrier> {
    const carrier = await this.carriersRepo.findOne({
      where: { id },
      relations: ['shipments'],
    });
    if (!carrier) throw new NotFoundException('Carrier not found');
    return carrier;
  }

  async update(id: string, dto: UpdateCarrierDto): Promise<Carrier> {
    await this.carriersRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.carriersRepo.delete(id);
  }

  async assignCarrier(dto: AssignCarrierDto): Promise<Shipment> {
    const shipment = await this.shipmentsRepo.findOne({
      where: { id: dto.shipmentId },
    });
    const carrier = await this.carriersRepo.findOne({ where: { id: dto.carrierId } });

    if (!shipment) throw new NotFoundException('Shipment not found');
    if (!carrier) throw new NotFoundException('Carrier not found');

    shipment.carrier = carrier;
    return this.shipmentsRepo.save(shipment);
  }
}
