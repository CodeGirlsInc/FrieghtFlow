// customs-compliance.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindManyOptions } from 'typeorm';
import { CustomsDocument, DocumentStatus } from './entities/customs-document.entity';
import { ComplianceCheck, CheckStatus } from './entities/compliance-check.entity';
import { CustomsRequirement, RequirementType } from './entities/customs-requirement.entity';
import { CreateCustomsDocumentDto } from './dto/create-customs-document.dto';
import { UpdateCustomsDocumentDto } from './dto/update-customs-document.dto';
import { CreateComplianceCheckDto } from './dto/create-compliance-check.dto';
import { UpdateComplianceCheckDto } from './dto/update-compliance-check.dto';
import { CreateCustomsRequirementDto } from './dto/create-customs-requirement.dto';
import { UpdateCustomsRequirementDto } from './dto/update-customs-requirement.dto';
import { DocumentValidationService } from './services/document-validation.service';

@Injectable()
export class CustomsComplianceService {
  constructor(
    @InjectRepository(CustomsDocument)
    private customsDocRepo: Repository<CustomsDocument>,
    @InjectRepository(ComplianceCheck)
    private complianceRepo: Repository<ComplianceCheck>,
    @InjectRepository(CustomsRequirement)
    private requirementRepo: Repository<CustomsRequirement>,
    private documentValidationService: DocumentValidationService,
  ) {}

  // Customs Requirements Management

  async createRequirement(dto: CreateCustomsRequirementDto): Promise<CustomsRequirement> {
    // Check if requirement code already exists
    const existing = await this.requirementRepo.findOne({
      where: { requirementCode: dto.requirementCode },
    });
    if (existing) {
      throw new BadRequestException('Requirement code already exists');
    }

    const requirement = this.requirementRepo.create(dto);
    return this.requirementRepo.save(requirement);
  }

  async findAllRequirements(query: any): Promise<{
    data: CustomsRequirement[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.requirementCode) {
      where.requirementCode = Like(`%${filters.requirementCode}%`);
    }
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.originCountry) {
      where.originCountry = filters.originCountry;
    }
    if (filters.destinationCountry) {
      where.destinationCountry = filters.destinationCountry;
    }
    if (filters.shipmentType) {
      where.shipmentType = filters.shipmentType;
    }
    if (filters.cargoType) {
      where.cargoType = filters.cargoType;
    }
    if (filters.status) {
      where.status = filters.status;
    }

    const findOptions: FindManyOptions<CustomsRequirement> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    };

    const [data, total] = await this.requirementRepo.findAndCount(findOptions);
    return { data, total, page, limit };
  }

  async findRequirementById(id: string): Promise<CustomsRequirement> {
    const requirement = await this.requirementRepo.findOne({ where: { id } });
    if (!requirement) {
      throw new NotFoundException('Requirement not found');
    }
    return requirement;
  }

  async updateRequirement(id: string, dto: UpdateCustomsRequirementDto): Promise<CustomsRequirement> {
    const requirement = await this.findRequirementById(id);
    Object.assign(requirement, dto);
    return this.requirementRepo.save(requirement);
  }

  async deleteRequirement(id: string): Promise<void> {
    const requirement = await this.findRequirementById(id);
    await this.requirementRepo.remove(requirement);
  }

  // Document Management

  async uploadDocument(dto: CreateCustomsDocumentDto): Promise<CustomsDocument> {
    const doc = this.customsDocRepo.create({
      ...dto,
      expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
    });
    const savedDoc = await this.customsDocRepo.save(doc);
    
    // Auto-validate the document
    await this.documentValidationService.validateDocument(savedDoc.id);
    
    return savedDoc;
  }

  async findAllDocuments(query: any): Promise<{
    data: CustomsDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.shipmentId) {
      where.shipmentId = filters.shipmentId;
    }
    if (filters.documentType) {
      where.documentType = filters.documentType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.requirementId) {
      where.requirementId = filters.requirementId;
    }

    const findOptions: FindManyOptions<CustomsDocument> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['requirement'],
    };

    const [data, total] = await this.customsDocRepo.findAndCount(findOptions);
    return { data, total, page, limit };
  }

  async findDocumentById(id: string): Promise<CustomsDocument> {
    const doc = await this.customsDocRepo.findOne({
      where: { id },
      relations: ['requirement'],
    });
    if (!doc) {
      throw new NotFoundException('Document not found');
    }
    return doc;
  }

  async updateDocument(id: string, dto: UpdateCustomsDocumentDto): Promise<CustomsDocument> {
    const doc = await this.findDocumentById(id);
    Object.assign(doc, dto);
    
    if (dto.expiryDate) {
      doc.expiryDate = new Date(dto.expiryDate);
    }
    
    const savedDoc = await this.customsDocRepo.save(doc);
    
    // Re-validate if document was updated
    if (dto.fileUrl || dto.metadata) {
      await this.documentValidationService.validateDocument(savedDoc.id);
    }
    
    return savedDoc;
  }

  async deleteDocument(id: string): Promise<void> {
    const doc = await this.findDocumentById(id);
    await this.customsDocRepo.remove(doc);
  }

  async validateDocument(id: string) {
    return this.documentValidationService.validateDocument(id);
  }

  // Compliance Check Management

  async createComplianceCheck(dto: CreateComplianceCheckDto): Promise<ComplianceCheck> {
    const check = this.complianceRepo.create({
      ...dto,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
    });
    return this.complianceRepo.save(check);
  }

  async findAllComplianceChecks(query: any): Promise<{
    data: ComplianceCheck[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.shipmentId) {
      where.shipmentId = filters.shipmentId;
    }
    if (filters.checkType) {
      where.checkType = filters.checkType;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.isAutomated !== undefined) {
      where.isAutomated = filters.isAutomated;
    }

    const findOptions: FindManyOptions<ComplianceCheck> = {
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['requirement'],
    };

    const [data, total] = await this.complianceRepo.findAndCount(findOptions);
    return { data, total, page, limit };
  }

  async findComplianceCheckById(id: string): Promise<ComplianceCheck> {
    const check = await this.complianceRepo.findOne({
      where: { id },
      relations: ['requirement'],
    });
    if (!check) {
      throw new NotFoundException('Compliance check not found');
    }
    return check;
  }

  async updateComplianceCheck(id: string, dto: UpdateComplianceCheckDto): Promise<ComplianceCheck> {
    const check = await this.findComplianceCheckById(id);
    Object.assign(check, dto);
    
    if (dto.scheduledAt) {
      check.scheduledAt = new Date(dto.scheduledAt);
    }
    
    return this.complianceRepo.save(check);
  }

  async deleteComplianceCheck(id: string): Promise<void> {
    const check = await this.findComplianceCheckById(id);
    await this.complianceRepo.remove(check);
  }

  async getComplianceHistory(shipmentId: string): Promise<ComplianceCheck[]> {
    return this.complianceRepo.find({
      where: { shipmentId },
      relations: ['requirement'],
      order: { createdAt: 'DESC' },
    });
  }

  // Enhanced Compliance Validation

  /**
   * Determines whether a shipment has satisfied customs compliance
   * by verifying documents and checks against requirements.
   */
  async isShipmentCompliant(shipmentId: string): Promise<{ compliant: boolean; reasons: string[] }> {
    const [documents, checks, requirements] = await Promise.all([
      this.customsDocRepo.find({ where: { shipmentId }, relations: ['requirement'] }),
      this.complianceRepo.find({ where: { shipmentId }, relations: ['requirement'] }),
      this.requirementRepo.find({ where: { status: 'active' } }),
    ]);

    const reasons: string[] = [];

    // Check if all mandatory requirements are satisfied
    const mandatoryRequirements = requirements.filter(r => r.isMandatory);
    
    for (const requirement of mandatoryRequirements) {
      const hasDocument = documents.some(d => 
        d.requirementId === requirement.id && d.status === DocumentStatus.APPROVED
      );
      
      const hasCheck = checks.some(c => 
        c.requirementId === requirement.id && c.status === CheckStatus.PASSED
      );

      if (requirement.type === RequirementType.DOCUMENT && !hasDocument) {
        reasons.push(`Missing required document: ${requirement.name} (${requirement.requirementCode})`);
      }
      
      if (requirement.type === RequirementType.COMPLIANCE_CHECK && !hasCheck) {
        reasons.push(`Missing required compliance check: ${requirement.name} (${requirement.requirementCode})`);
      }
    }

    // Check for rejected documents
    const rejectedDocs = documents.filter(d => d.status === DocumentStatus.REJECTED);
    if (rejectedDocs.length > 0) {
      reasons.push(`${rejectedDocs.length} document(s) have been rejected`);
    }

    // Check for failed compliance checks
    const failedChecks = checks.filter(c => c.status === CheckStatus.FAILED);
    if (failedChecks.length > 0) {
      reasons.push(`${failedChecks.length} compliance check(s) have failed`);
    }

    // Check for expired documents
    const expiredDocs = documents.filter(d => 
      d.expiryDate && d.expiryDate <= new Date() && d.status !== DocumentStatus.EXPIRED
    );
    if (expiredDocs.length > 0) {
      reasons.push(`${expiredDocs.length} document(s) have expired`);
    }

    return { compliant: reasons.length === 0, reasons };
  }

  /**
   * Gets requirements applicable to a specific shipment route and type
   */
  async getApplicableRequirements(
    originCountry: string,
    destinationCountry: string,
    shipmentType?: string,
    cargoType?: string
  ): Promise<CustomsRequirement[]> {
    const where: any = {
      originCountry,
      destinationCountry,
      status: 'active',
    };

    if (shipmentType) {
      where.shipmentType = shipmentType;
    }

    if (cargoType) {
      where.cargoType = cargoType;
    }

    return this.requirementRepo.find({
      where,
      order: { priority: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Auto-generates compliance checks based on requirements
   */
  async generateComplianceChecks(shipmentId: string): Promise<ComplianceCheck[]> {
    // This would typically get shipment details to determine applicable requirements
    // For now, we'll create basic checks for common requirements
    
    const commonChecks = [
      {
        shipmentId,
        checkType: 'document_validation' as any,
        checkName: 'Document Format Validation',
        description: 'Validates document format and completeness',
        isAutomated: true,
        isMandatory: true,
        priority: 'high' as any,
      },
      {
        shipmentId,
        checkType: 'content_verification' as any,
        checkName: 'Content Verification',
        description: 'Verifies document content accuracy',
        isAutomated: false,
        isMandatory: true,
        priority: 'medium' as any,
      },
      {
        shipmentId,
        checkType: 'expiry_check' as any,
        checkName: 'Document Expiry Check',
        description: 'Checks document expiry dates',
        isAutomated: true,
        isMandatory: true,
        priority: 'high' as any,
      },
    ];

    const checks = this.complianceRepo.create(commonChecks);
    return this.complianceRepo.save(checks);
  }
}
