import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Shipment,
  ShipmentStatus,
  ShipmentStatusHistory,
} from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Injectable()
export class TrackingSystemService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepo: Repository<Shipment>,

    @InjectRepository(ShipmentStatusHistory)
    private statusHistoryRepo: Repository<ShipmentStatusHistory>,
  ) {}

  async create(createDto: CreateShipmentDto): Promise<Shipment> {
    const shipment = this.shipmentRepo.create({
      shipperId: createDto.shipperId,
      customerId: createDto.customerId,
      status: ShipmentStatus.CREATED,
    });

    await this.shipmentRepo.save(shipment);

    await this.statusHistoryRepo.save(
      this.statusHistoryRepo.create({
        shipment,
        status: ShipmentStatus.CREATED,
        timestamp: new Date(),
      }),
    );

    return shipment;
  }

  async updateStatus(
    shipmentId: string,
    updateDto: UpdateShipmentStatusDto,
  ): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
      relations: ['statusHistory'],
    });
    if (!shipment) throw new NotFoundException('Shipment not found');

    if (!this.isValidStatusTransition(shipment.status, updateDto.status)) {
      throw new BadRequestException('Invalid status transition');
    }

    if (!location) throw new NotFoundException('Location not found');

    shipment.status = updateDto.status;
    await this.shipmentRepo.save(shipment);

    const history = this.statusHistoryRepo.create({
      shipment,
      status: updateDto.status,
      timestamp: new Date(),
    });

    await this.statusHistoryRepo.save(history);

    return shipment;
  }

  async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
      relations: ['statusHistory', 'statusHistory.location'],
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    return shipment;
  }

  private isValidStatusTransition(
    current: ShipmentStatus,
    next: ShipmentStatus,
  ): boolean {
    const order = [
      ShipmentStatus.CREATED,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.ARRIVED,
      ShipmentStatus.DELIVERED,
    ];
    return order.indexOf(next) === order.indexOf(current) + 1;
  }
}
