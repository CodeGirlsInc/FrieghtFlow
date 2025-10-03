import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import { CreateVehicleDto, VehicleStatus, VehicleType } from '../dto/create-vehicle.dto';
import { UpdateVehicleStatusDto } from '../dto/update-vehicle-status.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const existingVehicle = await this.vehicleRepository.findOne({
      where: { registrationNumber: createVehicleDto.registrationNumber }
    });

    if (existingVehicle) {
      throw new ConflictException('Vehicle with this registration number already exists');
    }

    const vehicle = this.vehicleRepository.create({
      ...createVehicleDto,
      status: createVehicleDto.status || VehicleStatus.AVAILABLE,
      isAvailable: createVehicleDto.isAvailable !== false,
    });

    return this.vehicleRepository.save(vehicle);
  }

  async findAll(carrierId?: string): Promise<Vehicle[]> {
    const where = carrierId ? { carrierId } : {};
    return this.vehicleRepository.find({
      where,
      relations: ['carrier', 'maintenanceRecords'],
    });
  }

  async findOne(id: string): Promise<Vehicle> {
    const vehicle = await this.vehicleRepository.findOne({
      where: { id },
      relations: ['carrier', 'maintenanceRecords'],
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }

    return vehicle;
  }

  async findAvailable(type?: VehicleType, minCapacity?: number): Promise<Vehicle[]> {
    const query = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('vehicle.status = :status', { status: VehicleStatus.AVAILABLE });

    if (type) {
      query.andWhere('vehicle.type = :type', { type });
    }

    if (minCapacity) {
      query.andWhere('vehicle.capacityWeight >= :minCapacity', { minCapacity });
    }

    return query.getMany();
  }

  async updateStatus(id: string, updateStatusDto: UpdateVehicleStatusDto): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, updateStatusDto);
    return this.vehicleRepository.save(vehicle);
  }

  async update(id: string, updateVehicleDto: Partial<CreateVehicleDto>): Promise<Vehicle> {
    const vehicle = await this.findOne(id);
    Object.assign(vehicle, updateVehicleDto);
    return this.vehicleRepository.save(vehicle);
  }

  async remove(id: string): Promise<void> {
    const vehicle = await this.findOne(id);
    await this.vehicleRepository.remove(vehicle);
  }

  async getFleetStatistics(carrierId: string): Promise<any> {
    const vehicles = await this.findAll(carrierId);

    return {
      total: vehicles.length,
      byType: {
        trucks: vehicles.filter(v => v.type === VehicleType.TRUCK).length,
        ships: vehicles.filter(v => v.type === VehicleType.SHIP).length,
        planes: vehicles.filter(v => v.type === VehicleType.PLANE).length,
      },
      byStatus: {
        available: vehicles.filter(v => v.status === VehicleStatus.AVAILABLE).length,
        inTransit: vehicles.filter(v => v.status === VehicleStatus.IN_TRANSIT).length,
        maintenance: vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length,
        outOfService: vehicles.filter(v => v.status === VehicleStatus.OUT_OF_SERVICE).length,
      },
      totalCapacity: {
        weight: vehicles.reduce((sum, v) => sum + Number(v.capacityWeight), 0),
        volume: vehicles.reduce((sum, v) => sum + Number(v.capacityVolume), 0),
      },
    };
  }
}
