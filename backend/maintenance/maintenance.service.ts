import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRequest, MaintenanceStatus } from './entities/maintenance-request.entity';
import { CreateMaintenanceRequestDto } from './dto/create-maintenance-request.dto';
import { UpdateMaintenanceRequestDto } from './dto/update-maintenance-request.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRequest)
    private readonly requestRepository: Repository<MaintenanceRequest>,
  ) {}

  async create(carrierId: string, createDto: CreateMaintenanceRequestDto): Promise<MaintenanceRequest> {
    const newRequest = this.requestRepository.create({
      ...createDto,
      carrierId, // Associate the request with the carrier
      status: MaintenanceStatus.PENDING,
    });
    return this.requestRepository.save(newRequest);
  }

  async findAllForCarrier(carrierId: string): Promise<MaintenanceRequest[]> {
    return this.requestRepository.find({ where: { carrierId } });
  }

  async findOne(id: string, carrierId: string): Promise<MaintenanceRequest> {
    const request = await this.requestRepository.findOne({ where: { id, carrierId } });
    if (!request) {
      throw new NotFoundException(`Maintenance request with ID "${id}" not found.`);
    }
    return request;
  }

  async update(id: string, carrierId: string, updateDto: UpdateMaintenanceRequestDto): Promise<MaintenanceRequest> {
    const request = await this.findOne(id, carrierId);

    // Update the properties
    Object.assign(request, updateDto);

    return this.requestRepository.save(request);
  }

  async remove(id: string, carrierId: string): Promise<{ deleted: boolean }> {
    const request = await this.findOne(id, carrierId);
    await this.requestRepository.remove(request);
    return { deleted: true };
  }
}