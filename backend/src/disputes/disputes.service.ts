import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dispute, DisputeStatus } from './entities/dispute.entity';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { FilterDisputeDto } from './dto/filter-dispute.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../audit-log/entities/audit-log.entity';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepo: Repository<Dispute>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async create(dto: CreateDisputeDto, raisedByUserId?: string): Promise<Dispute> {
    const dispute = this.disputeRepo.create({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      status: DisputeStatus.PENDING,
      raisedByUserId,
      againstPartnerId: dto.againstPartnerId,
      evidenceUrls: dto.evidenceUrls,
    });

    const saved = await this.disputeRepo.save(dispute);

    await this.auditLogService.createLog({
      action: AuditAction.USER_CREATED,
      userId: raisedByUserId,
      entityType: 'Dispute',
      entityId: saved.id,
      newValues: saved,
      source: 'disputes-service',
    });

    return saved;
  }

  async findAll(filter: FilterDisputeDto): Promise<Dispute[]> {
    const qb = this.disputeRepo.createQueryBuilder('d');

    if (filter.status) qb.andWhere('d.status = :status', { status: filter.status });
    if (filter.category) qb.andWhere('d.category = :category', { category: filter.category });
    if (filter.raisedByUserId) qb.andWhere('d.raisedByUserId = :raisedByUserId', { raisedByUserId: filter.raisedByUserId });
    if (filter.againstPartnerId) qb.andWhere('d.againstPartnerId = :againstPartnerId', { againstPartnerId: filter.againstPartnerId });
    if (filter.startDate && filter.endDate) qb.andWhere('d.createdAt BETWEEN :start AND :end', { start: filter.startDate, end: filter.endDate });
    if (filter.search) qb.andWhere('(d.title ILIKE :search OR d.description ILIKE :search)', { search: `%${filter.search}%` });

    qb.orderBy('d.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: string): Promise<Dispute> {
    const dispute = await this.disputeRepo.findOne({ where: { id } });
    if (!dispute) throw new NotFoundException(`Dispute ${id} not found`);
    return dispute;
  }

  async updateStatus(id: string, dto: UpdateDisputeStatusDto, actorUserId?: string): Promise<Dispute> {
    const dispute = await this.findOne(id);

    // Enforce valid transitions
    const validTransitions: Record<DisputeStatus, DisputeStatus[]> = {
      [DisputeStatus.PENDING]: [DisputeStatus.UNDER_REVIEW],
      [DisputeStatus.UNDER_REVIEW]: [DisputeStatus.RESOLVED],
      [DisputeStatus.RESOLVED]: [],
    };

    if (!validTransitions[dispute.status].includes(dto.status)) {
      throw new BadRequestException(`Invalid status transition from ${dispute.status} to ${dto.status}`);
    }

    const oldStatus = dispute.status;
    dispute.status = dto.status;
    if (dto.resolutionNotes) dispute.resolutionNotes = dto.resolutionNotes;
    if (dto.status === DisputeStatus.RESOLVED) dispute.resolvedAt = new Date();

    const saved = await this.disputeRepo.save(dispute);

    await this.auditLogService.createLog({
      action: AuditAction.USER_UPDATED,
      userId: actorUserId,
      entityType: 'Dispute',
      entityId: saved.id,
      oldValues: { status: oldStatus },
      newValues: { status: saved.status, resolutionNotes: saved.resolutionNotes },
      source: 'disputes-service',
    });

    return saved;
  }
}