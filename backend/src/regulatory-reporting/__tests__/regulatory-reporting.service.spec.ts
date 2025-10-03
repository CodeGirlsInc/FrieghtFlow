import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegulatoryReportingService } from '../regulatory-reporting.service';
import { RegulatoryReport, ReportType, ReportFormat, ReportStatus } from '../entities/regulatory-report.entity';
import { CustomsDocument } from '../../customs/entities/customs-document.entity';
import { ComplianceCheck } from '../../customs/entities/compliance-check.entity';
import { CustomsRequirement } from '../../customs/entities/customs-requirement.entity';

describe('RegulatoryReportingService', () => {
  let service: RegulatoryReportingService;
  let reportRepository: MockRepository<RegulatoryReport>;
  let documentRepository: MockRepository<CustomsDocument>;
  let checkRepository: MockRepository<ComplianceCheck>;
  let requirementRepository: MockRepository<CustomsRequirement>;

  // Mock repository type
  type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

  // Create mock repository factory
  const createMockRepository = <T>(): MockRepository<T> => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    findAndCount: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegulatoryReportingService,
        {
          provide: getRepositoryToken(RegulatoryReport),
          useValue: createMockRepository<RegulatoryReport>(),
        },
        {
          provide: getRepositoryToken(CustomsDocument),
          useValue: createMockRepository<CustomsDocument>(),
        },
        {
          provide: getRepositoryToken(ComplianceCheck),
          useValue: createMockRepository<ComplianceCheck>(),
        },
        {
          provide: getRepositoryToken(CustomsRequirement),
          useValue: createMockRepository<CustomsRequirement>(),
        },
      ],
    }).compile();

    service = module.get<RegulatoryReportingService>(RegulatoryReportingService);
    reportRepository = module.get(getRepositoryToken(RegulatoryReport));
    documentRepository = module.get(getRepositoryToken(CustomsDocument));
    checkRepository = module.get(getRepositoryToken(ComplianceCheck));
    requirementRepository = module.get(getRepositoryToken(CustomsRequirement));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    it('should create a new report', async () => {
      const createReportDto = {
        title: 'Test Report',
        type: ReportType.COMPLIANCE_SUMMARY,
        format: ReportFormat.CSV,
      };

      const report = new RegulatoryReport();
      Object.assign(report, createReportDto);
      report.status = ReportStatus.PENDING;

      reportRepository.create.mockReturnValue(report);
      reportRepository.save.mockResolvedValue(report);

      const result = await service.createReport(createReportDto);

      expect(reportRepository.create).toHaveBeenCalledWith({
        ...createReportDto,
        status: ReportStatus.PENDING,
      });
      expect(reportRepository.save).toHaveBeenCalledWith(report);
      expect(result).toEqual(report);
    });
  });

  describe('findAllReports', () => {
    it('should return all reports', async () => {
      const reports = [
        { id: '1', title: 'Report 1' },
        { id: '2', title: 'Report 2' },
      ] as RegulatoryReport[];

      reportRepository.find.mockResolvedValue(reports);

      const result = await service.findAllReports();

      expect(reportRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(reports);
    });

    it('should return reports with filters', async () => {
      const reports = [{ id: '1', title: 'Report 1' }] as RegulatoryReport[];
      const filters = { type: ReportType.COMPLIANCE_SUMMARY };

      reportRepository.find.mockResolvedValue(reports);

      const result = await service.findAllReports(filters);

      expect(reportRepository.find).toHaveBeenCalledWith({
        where: filters,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(reports);
    });
  });

  describe('findReportById', () => {
    it('should return a report by id', async () => {
      const report = { id: '1', title: 'Test Report' } as RegulatoryReport;

      reportRepository.findOne.mockResolvedValue(report);

      const result = await service.findReportById('1');

      expect(reportRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(report);
    });

    it('should throw an error if report not found', async () => {
      reportRepository.findOne.mockResolvedValue(null);

      await expect(service.findReportById('1')).rejects.toThrow('Report not found');
    });
  });

  describe('updateReport', () => {
    it('should update a report', async () => {
      const existingReport = { id: '1', title: 'Old Title' } as RegulatoryReport;
      const updateData = { title: 'New Title' };

      reportRepository.findOne.mockResolvedValue(existingReport);
      reportRepository.save.mockResolvedValue({ ...existingReport, ...updateData });

      const result = await service.updateReport('1', updateData);

      expect(reportRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(reportRepository.save).toHaveBeenCalledWith({ ...existingReport, ...updateData });
      expect(result.title).toEqual('New Title');
    });
  });

  describe('deleteReport', () => {
    it('should delete a report', async () => {
      const report = { id: '1', title: 'Test Report' } as RegulatoryReport;

      reportRepository.findOne.mockResolvedValue(report);
      reportRepository.remove.mockResolvedValue(undefined);

      await service.deleteReport('1');

      expect(reportRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(reportRepository.remove).toHaveBeenCalledWith(report);
    });
  });

  describe('generateComplianceSummaryReport', () => {
    it('should generate compliance summary report', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      const documents = [
        { id: '1', status: 'approved' },
        { id: '2', status: 'rejected' },
        { id: '3', status: 'pending' },
      ] as CustomsDocument[];
      
      const checks = [
        { id: '1', status: 'passed' },
        { id: '2', status: 'failed' },
        { id: '3', status: 'pending' },
      ] as ComplianceCheck[];
      
      const requirements = [
        { id: '1', type: 'document', isMandatory: true, status: 'active' },
        { id: '2', type: 'compliance_check', isMandatory: false, status: 'inactive' },
      ] as CustomsRequirement[];

      documentRepository.find.mockResolvedValue(documents);
      checkRepository.find.mockResolvedValue(checks);
      requirementRepository.find.mockResolvedValue(requirements);

      const result = await service.generateComplianceSummaryReport(startDate, endDate);

      expect(documentRepository.find).toHaveBeenCalled();
      expect(checkRepository.find).toHaveBeenCalled();
      expect(requirementRepository.find).toHaveBeenCalled();
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('requirementStats');
    });
  });

  describe('generateCustomsDocumentsReport', () => {
    it('should generate customs documents report', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      const documents = [
        { 
          id: '1', 
          shipmentId: 'shipment-1',
          documentType: 'commercial_invoice',
          status: 'approved',
          fileName: 'invoice.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
          requirement: {
            requirementCode: 'REQ-001',
            name: 'Commercial Invoice',
            type: 'document'
          }
        },
      ] as any;

      documentRepository.find.mockResolvedValue(documents);

      const result = await service.generateCustomsDocumentsReport(startDate, endDate);

      expect(documentRepository.find).toHaveBeenCalled();
      expect(result).toHaveProperty('documents');
      expect(result.documents).toHaveLength(1);
    });
  });

  describe('generateComplianceChecksReport', () => {
    it('should generate compliance checks report', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      const checks = [
        { 
          id: '1', 
          shipmentId: 'shipment-1',
          checkType: 'document_validation',
          checkName: 'Document Validation',
          status: 'passed',
          priority: 'high',
          isAutomated: true,
          isMandatory: true,
          performedBy: 'system',
          performedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          requirement: {
            requirementCode: 'REQ-002',
            name: 'Document Validation',
            type: 'compliance_check'
          }
        },
      ] as any;

      checkRepository.find.mockResolvedValue(checks);

      const result = await service.generateComplianceChecksReport(startDate, endDate);

      expect(checkRepository.find).toHaveBeenCalled();
      expect(result).toHaveProperty('checks');
      expect(result.checks).toHaveLength(1);
    });
  });

  describe('exportToCSV', () => {
    it('should export compliance summary to CSV', async () => {
      const data = {
        summary: {
          totalDocuments: 10,
          approvedDocuments: 8,
          rejectedDocuments: 1,
          pendingDocuments: 1,
          documentApprovalRate: '80.00',
          totalChecks: 15,
          passedChecks: 12,
          failedChecks: 2,
          pendingChecks: 1,
          complianceRate: '80.00',
        }
      };

      const result = await service.exportToCSV(data, ReportType.COMPLIANCE_SUMMARY);

      expect(typeof result).toBe('string');
      expect(result).toContain('Metric,Value');
      expect(result).toContain('Total Documents,10');
    });

    it('should export customs documents to CSV', async () => {
      const data = {
        documents: [
          {
            id: '1',
            shipmentId: 'shipment-1',
            documentType: 'commercial_invoice',
            status: 'approved',
            fileName: 'invoice.pdf',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          }
        ]
      };

      const result = await service.exportToCSV(data, ReportType.CUSTOMS_DOCUMENTS);

      expect(typeof result).toBe('string');
      expect(result).toContain('ID,Shipment ID,Document Type,Status,File Name,Created At,Updated At');
    });

    it('should export compliance checks to CSV', async () => {
      const data = {
        checks: [
          {
            id: '1',
            shipmentId: 'shipment-1',
            checkType: 'document_validation',
            checkName: 'Document Validation',
            status: 'passed',
            priority: 'high',
            isAutomated: true,
            isMandatory: true,
            performedBy: 'system',
            performedAt: '2023-01-01T00:00:00.000Z',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          }
        ]
      };

      const result = await service.exportToCSV(data, ReportType.COMPLIANCE_CHECKS);

      expect(typeof result).toBe('string');
      expect(result).toContain('ID,Shipment ID,Check Type,Check Name,Status,Priority,Is Automated,Is Mandatory,Performed By,Performed At,Created At,Updated At');
    });
  });

  describe('exportToPDF', () => {
    it('should export compliance summary to PDF-like format', async () => {
      const data = {
        period: {
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-12-31T00:00:00.000Z',
        },
        summary: {
          totalDocuments: 10,
          approvedDocuments: 8,
          rejectedDocuments: 1,
          pendingDocuments: 1,
          documentApprovalRate: '80.00',
          totalChecks: 15,
          passedChecks: 12,
          failedChecks: 2,
          pendingChecks: 1,
          complianceRate: '80.00',
        }
      };

      const result = await service.exportToPDF(data, ReportType.COMPLIANCE_SUMMARY);

      expect(typeof result).toBe('string');
      expect(result).toContain('COMPLIANCE SUMMARY REPORT');
    });

    it('should export customs documents to PDF-like format', async () => {
      const data = {
        period: {
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-12-31T00:00:00.000Z',
        },
        documents: [
          {
            id: '1',
            shipmentId: 'shipment-1',
            documentType: 'commercial_invoice',
            status: 'approved',
            fileName: 'invoice.pdf',
            createdAt: '2023-01-01T00:00:00.000Z',
          }
        ]
      };

      const result = await service.exportToPDF(data, ReportType.CUSTOMS_DOCUMENTS);

      expect(typeof result).toBe('string');
      expect(result).toContain('CUSTOMS DOCUMENTS REPORT');
    });

    it('should export compliance checks to PDF-like format', async () => {
      const data = {
        period: {
          startDate: '2023-01-01T00:00:00.000Z',
          endDate: '2023-12-31T00:00:00.000Z',
        },
        checks: [
          {
            id: '1',
            shipmentId: 'shipment-1',
            checkType: 'document_validation',
            checkName: 'Document Validation',
            status: 'passed',
            priority: 'high',
            isAutomated: true,
            isMandatory: true,
            performedBy: 'system',
            performedAt: '2023-01-01T00:00:00.000Z',
            createdAt: '2023-01-01T00:00:00.000Z',
          }
        ]
      };

      const result = await service.exportToPDF(data, ReportType.COMPLIANCE_CHECKS);

      expect(typeof result).toBe('string');
      expect(result).toContain('COMPLIANCE CHECKS REPORT');
    });
  });
});