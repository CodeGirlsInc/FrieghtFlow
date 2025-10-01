import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { MaintenanceRecord } from '../entities/maintenance-record.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateMaintenanceDto, MaintenanceStatus } from '../dto/create-maintenance.dto';
import { VehicleStatus } from '../dto/create-vehicle.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(MaintenanceRecord)
    private maintenanceRepository: Repository<MaintenanceRecord>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto): Promise<MaintenanceRecord> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id: createMaintenanceDto.vehicleId }
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${createMaintenanceDto.vehicleId} not found`);
    }

    const maintenance = this.maintenanceRepository.create({
      ...createMaintenanceDto,
      status: createMaintenanceDto.status || MaintenanceStatus.SCHEDULED,
    });

    const savedMaintenance = await this.maintenanceRepository.save(maintenance);

    // Update vehicle status if maintenance is in progress
    if (savedMaintenance.status === MaintenanceStatus.IN_PROGRESS) {
      vehicle.status = VehicleStatus.MAINTENANCE;
      vehicle.isAvailable = false;
      await this.vehicleRepository.save(vehicle);
    }

    return savedMaintenance;
  }

  async findAll(vehicleId?: string): Promise<MaintenanceRecord[]> {
    const where = vehicleId ? { vehicleId } : {};
    return this.maintenanceRepository.find({
      where,
      relations: ['vehicle'],
      order: { scheduledDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MaintenanceRecord> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['vehicle'],
    });

    if (!maintenance) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }

    return maintenance;
  }

  async updateStatus(id: string, status: MaintenanceStatus, completedDate?: Date): Promise<MaintenanceRecord> {
    const maintenance = await this.findOne(id);
    maintenance.status = status;

    if (status === MaintenanceStatus.COMPLETED && completedDate) {
      maintenance.completedDate = completedDate;
      
      // Update vehicle status back to available
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: maintenance.vehicleId }
      });
      
      if (vehicle) {
        vehicle.status = VehicleStatus.AVAILABLE;
        vehicle.isAvailable = true;
        vehicle.lastMaintenanceDate = completedDate;
        await this.vehicleRepository.save(vehicle);
      }
    }

    return this.maintenanceRepository.save(maintenance);
  }

  async findUpcoming(days: number = 30): Promise<MaintenanceRecord[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.maintenanceRepository.find({
      where: {
        scheduledDate: MoreThan(today) && LessThan(futureDate),
        status: MaintenanceStatus.SCHEDULED,
      },
      relations: ['vehicle'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async getMaintenanceHistory(vehicleId: string): Promise<MaintenanceRecord[]> {
    return this.maintenanceRepository.find({
      where: { vehicleId, status: MaintenanceStatus.COMPLETED },
      order: { completedDate: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id);
    await this.maintenanceRepository.remove(maintenance);
  }
}