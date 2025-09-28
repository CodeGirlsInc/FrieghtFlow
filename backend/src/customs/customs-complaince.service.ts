// customs-compliance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomsDocument } from './entities/customs-document.entity';
import { ComplianceCheck } from './entities/compliance-check.entity';
import { CreateCustomsDocumentDto } from './dto/create-customs-document.dto';
import { UpdateCustomsDocumentDto } from './dto/update-customs-document.dto';
import { CreateComplianceCheckDto } from './dto/create-compliance-check.dto';
import { UpdateComplianceCheckDto } from './dto/update-compliance-check.dto';

@Injectable()
export class CustomsComplianceService {
  constructor(
    @InjectRepository(CustomsDocument)
    private customsDocRepo: Repository<CustomsDocument>,
    @InjectRepository(ComplianceCheck)
    private complianceRepo: Repository<ComplianceCheck>,
  ) {}

  async uploadDocument(dto: CreateCustomsDocumentDto) {
    const doc = this.customsDocRepo.create(dto);
    return this.customsDocRepo.save(doc);
  }

  async updateDocument(id: string, dto: UpdateCustomsDocumentDto) {
    const doc = await this.customsDocRepo.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found');
    Object.assign(doc, dto);
    return this.customsDocRepo.save(doc);
  }

  async createComplianceCheck(dto: CreateComplianceCheckDto) {
    const check = this.complianceRepo.create(dto);
    return this.complianceRepo.save(check);
  }

  async updateComplianceCheck(id: string, dto: UpdateComplianceCheckDto) {
    const check = await this.complianceRepo.findOne({ where: { id } });
    if (!check) throw new NotFoundException('Compliance check not found');
    Object.assign(check, dto);
    return this.complianceRepo.save(check);
  }

  async getComplianceHistory(shipmentId: string) {
    return this.complianceRepo.find({ where: { shipmentId } });
  }

  /**
   * Determines whether a shipment has satisfied customs compliance
   * by verifying documents and checks.
   * Rules:
   * - There must be at least one customs document for the shipment and
   *   every document must have status 'approved'.
   * - There must be at least one compliance check and every check must have
   *   status 'passed'.
   */
  async isShipmentCompliant(shipmentId: string): Promise<{ compliant: boolean; reasons: string[] }>{
    const [documents, checks] = await Promise.all([
      this.customsDocRepo.find({ where: { shipmentId } }),
      this.complianceRepo.find({ where: { shipmentId } }),
    ]);

    const reasons: string[] = [];

    if (documents.length === 0) {
      reasons.push('No customs documents uploaded');
    } else if (documents.some((d) => d.status !== 'approved')) {
      reasons.push('All customs documents must be approved');
    }

    if (checks.length === 0) {
      reasons.push('No compliance checks recorded');
    } else if (checks.some((c) => c.status !== 'passed')) {
      reasons.push('All compliance checks must be passed');
    }

    return { compliant: reasons.length === 0, reasons };
  }
}
