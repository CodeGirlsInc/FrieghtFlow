import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from '../common/enums/shipment-status.enum';
import { UserRole } from '../common/enums/role.enum';

export interface DisputeEvidence {
  id: string;
  shipmentId: string;
  submittedBy: string;
  fileUrl: string;
  description: string;
  createdAt: Date;
}

type SubmitEvidenceDto = Pick<DisputeEvidence, 'fileUrl' | 'description'>;

@Injectable()
export class DisputeEvidenceService {
  private readonly evidence = new Map<string, DisputeEvidence[]>();
  private idSeq = 1;

  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: shipmentId },
    });
    if (!shipment) {
      throw new NotFoundException(`Shipment ${shipmentId} not found`);
    }
    return shipment;
  }

  private assertAccess(shipment: Shipment, userId: string, isAdmin: boolean): void {
    if (!isAdmin) {
      const isParty =
        shipment.shipperId === userId || shipment.carrierId === userId;
      if (!isParty) {
        throw new ForbiddenException('Not a party to this shipment');
      }
    }
    if (shipment.status !== ShipmentStatus.DISPUTED) {
      throw new BadRequestException('Shipment is not in DISPUTED status');
    }
  }

  async submit(
    shipmentId: string,
    userId: string,
    isAdmin: boolean,
    dto: SubmitEvidenceDto,
  ): Promise<DisputeEvidence> {
    const shipment = await this.getShipment(shipmentId);
    this.assertAccess(shipment, userId, isAdmin);

    const record: DisputeEvidence = {
      id: String(this.idSeq++),
      shipmentId,
      submittedBy: userId,
      ...dto,
      createdAt: new Date(),
    };

    const list = this.evidence.get(shipmentId) ?? [];
    list.push(record);
    this.evidence.set(shipmentId, list);
    return record;
  }

  async findAll(
    shipmentId: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<DisputeEvidence[]> {
    const shipment = await this.getShipment(shipmentId);
    if (!isAdmin) {
      const isParty =
        shipment.shipperId === userId || shipment.carrierId === userId;
      if (!isParty) {
        throw new ForbiddenException('Not a party to this shipment');
      }
    }
    return this.evidence.get(shipmentId) ?? [];
  }
}
