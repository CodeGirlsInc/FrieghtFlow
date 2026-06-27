// #986 – Dispute evidence: upload, list & mediation tracking
import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';

export interface DisputeEvidence { id: string; disputeId: string; uploadedBy: string; fileUrl: string; description: string; createdAt: Date; }
export type MediationStatus = 'pending' | 'in_review' | 'resolved';

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name);
  private readonly evidence = new Map<string, DisputeEvidence[]>();

  async addEvidence(disputeId: string, userId: string, fileUrl: string, description: string): Promise<DisputeEvidence> {
    if (!fileUrl) throw new BadRequestException('File URL required');
    const ev: DisputeEvidence = { id: `ev_${Date.now()}`, disputeId, uploadedBy: userId, fileUrl, description, createdAt: new Date() };
    const list = this.evidence.get(disputeId) ?? [];
    list.push(ev);
    this.evidence.set(disputeId, list);
    this.logger.log(`Evidence added to dispute ${disputeId} by ${userId}`);
    return ev;
  }

  async listEvidence(disputeId: string): Promise<DisputeEvidence[]> {
    return this.evidence.get(disputeId) ?? [];
  }

  async getMediationStatus(disputeId: string): Promise<{ disputeId: string; status: MediationStatus }> {
    if (!this.evidence.has(disputeId)) throw new NotFoundException('Dispute not found');
    return { disputeId, status: 'pending' };
  }
}
