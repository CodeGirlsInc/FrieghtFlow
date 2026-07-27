import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisputeEvidence } from './entities/dispute-evidence.entity';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';
import { SubmitDisputeEvidenceDto } from './dto/submit-dispute-evidence.dto';

@Injectable()
export class DisputeEvidenceService {
  constructor(
    @InjectRepository(DisputeEvidence)
    private readonly evidenceRepo: Repository<DisputeEvidence>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (!shipment) {
      throw new NotFoundException(`Shipment ${shipmentId} not found`);
    }
    return shipment;
  }

  private assertParty(shipment: Shipment, userId: string): void {
    if (shipment.shipperId !== userId && shipment.carrierId !== userId) {
      throw new ForbiddenException('Not a party to this shipment');
    }
    if (shipment.status !== ShipmentStatus.DISPUTED) {
      throw new ForbiddenException('Shipment is not in DISPUTED status');
    }
  }

  async submit(
    shipmentId: string,
    userId: string,
    userRole: UserRole,
    dto: SubmitDisputeEvidenceDto,
  ): Promise<DisputeEvidence> {
    const shipment = await this.getShipment(shipmentId);
    if (userRole !== UserRole.ADMIN) {
      this.assertParty(shipment, userId);
    }

    const record = this.evidenceRepo.create({
      shipmentId,
      submittedBy: userId,
      description: dto.description,
      fileUrl: dto.fileUrl,
    });

    return this.evidenceRepo.save(record);
  }

  async findAll(
    shipmentId: string,
    userId: string,
    userRole: UserRole,
  ): Promise<DisputeEvidence[]> {
    const shipment = await this.getShipment(shipmentId);
    if (userRole !== UserRole.ADMIN) {
      this.assertParty(shipment, userId);
    }

    return this.evidenceRepo.find({
      where: { shipmentId },
      order: { createdAt: 'DESC' },
    });
  }
}
