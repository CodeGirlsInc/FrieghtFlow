import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';

export interface DisputeEvidence {
  id: string;
  shipmentId: string;
  submittedBy: string;
  fileUrl: string;
  description: string;
  createdAt: Date;
}

interface Shipment {
  id: string;
  status: string;
  senderId: string;
  carrierId: string;
}

type SubmitEvidenceDto = Pick<DisputeEvidence, 'fileUrl' | 'description'>;

@Injectable()
export class DisputeEvidenceService {
  private readonly evidence = new Map<string, DisputeEvidence[]>();
  private idSeq = 1;

  // Injected shipment repo in production; simplified here
  private getShipment(shipmentId: string): Shipment {
    // Placeholder — replace with actual repo lookup
    throw new NotFoundException(`Shipment ${shipmentId} not found`);
  }

  private assertAccess(shipment: Shipment, userId: string): void {
    if (shipment.senderId !== userId && shipment.carrierId !== userId) {
      throw new ForbiddenException('Not a party to this shipment');
    }
    if (shipment.status !== 'DISPUTED') {
      throw new ForbiddenException('Shipment is not in DISPUTED status');
    }
  }

  submit(shipmentId: string, userId: string, dto: SubmitEvidenceDto): DisputeEvidence {
    const shipment = this.getShipment(shipmentId);
    this.assertAccess(shipment, userId);

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

  findAll(shipmentId: string, userId: string, isAdmin: boolean): DisputeEvidence[] {
    const shipment = this.getShipment(shipmentId);
    if (!isAdmin) this.assertAccess(shipment, userId);
    return this.evidence.get(shipmentId) ?? [];
  }
}
