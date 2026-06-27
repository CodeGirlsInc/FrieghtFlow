import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { UserRole } from '../common/enums/role.enum';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepo: Repository<Dispute>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  async create(userId: string, dto: CreateDisputeDto): Promise<Dispute> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: dto.shipmentId },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    if (shipment.shipperId !== userId && shipment.carrierId !== userId) {
      throw new ForbiddenException(
        'You must be a party to the shipment to open a dispute',
      );
    }

    const active = await this.disputeRepo.findOne({
      where: { shipmentId: dto.shipmentId, status: DisputeStatus.OPEN },
    });
    if (active)
      throw new BadRequestException(
        'An active dispute already exists for this shipment',
      );

    const dispute = this.disputeRepo.create({
      shipmentId: dto.shipmentId,
      openedById: userId,
      reason: dto.reason,
    });
    return this.disputeRepo.save(dispute);
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<Dispute> {
    const dispute = await this.disputeRepo.findOne({
      where: { id },
      relations: ['shipment'],
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (
      role !== UserRole.ADMIN &&
      dispute.openedById !== userId &&
      dispute.shipment.shipperId !== userId &&
      dispute.shipment.carrierId !== userId
    ) {
      throw new ForbiddenException();
    }
    return dispute;
  }

  async resolve(
    id: string,
    adminId: string,
    dto: ResolveDisputeDto,
  ): Promise<Dispute> {
    const dispute = await this.disputeRepo.findOne({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    dispute.status = DisputeStatus.RESOLVED;
    dispute.resolutionNote = dto.resolutionNote;
    dispute.resolvedById = adminId;
    return this.disputeRepo.save(dispute);
  }

  async findAllAdmin(query: {
    page?: number;
    limit?: number;
    status?: DisputeStatus;
  }) {
    const { page = 1, limit = 20, status } = query;
    const qb = this.disputeRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.shipment', 'shipment')
      .orderBy('d.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    if (status) qb.andWhere('d.status = :status', { status });
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}
