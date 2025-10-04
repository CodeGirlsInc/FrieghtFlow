import { Test, TestingModule } from '@nestjs/testing';
import { RegulatoryReportingController } from '../regulatory-reporting.controller';
import { RegulatoryReportingService } from '../regulatory-reporting.service';
import { RegulatoryReport, ReportType, ReportFormat } from '../entities/regulatory-report.entity';

describe('RegulatoryReportingController', () => {
  let controller: RegulatoryReportingController;
  let service: jest.Mocked<RegulatoryReportingService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulatoryReportingController],
      providers: [
        {
          provide: RegulatoryReportingService,
          useValue: {
            createReport: jest.fn(),
            findAllReports: jest.fn(),
            findReportById: jest.fn(),
            generateComplianceSummaryReport: jest.fn(),
            generateCustomsDocumentsReport: jest.fn(),
            generateComplianceChecksReport: jest.fn(),
            exportToCSV: jest.fn(),
            exportToPDF: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RegulatoryReportingController>(RegulatoryReportingController);
    service = module.get(RegulatoryReportingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateReport', () => {
    it('should call service to create report', async () => {
      const createReportDto = {
        title: 'Test Report',
        type: ReportType.COMPLIANCE_SUMMARY,
        format: ReportFormat.CSV,
      };

      const report = { id: '1', ...createReportDto } as RegulatoryReport;
      service.createReport.mockResolvedValue(report);

      const result = await controller.generateReport(createReportDto);

      expect(service.createReport).toHaveBeenCalledWith(createReportDto);
      expect(result).toEqual(report);
    });
  });

  describe('findAllReports', () => {
    it('should call service to find all reports', async () => {
      const reports = [{ id: '1', title: 'Report 1' }] as RegulatoryReport[];
      service.findAllReports.mockResolvedValue(reports);

      const result = await controller.findAllReports({});

      expect(service.findAllReports).toHaveBeenCalledWith({});
      expect(result).toEqual(reports);
    });
  });

  describe('findReportById', () => {
    it('should call service to find report by id', async () => {
      const report = { id: '1', title: 'Test Report' } as RegulatoryReport;
      service.findReportById.mockResolvedValue(report);

      const result = await controller.findReportById('1');

      expect(service.findReportById).toHaveBeenCalledWith('1');
      expect(result).toEqual(report);
    });
  });

  describe('generateComplianceSummary', () => {
    it('should call service to generate compliance summary', async () => {
      const reportId = '1';
      const body = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        originCountry: 'US',
        destinationCountry: 'CA',
        shipmentType: 'air',
      };

      const summaryData = { summary: {}, requirementStats: {} };
      service.generateComplianceSummaryReport.mockResolvedValue(summaryData);

      const result = await controller.generateComplianceSummary(reportId, body);

      expect(service.generateComplianceSummaryReport).toHaveBeenCalledWith(
        new Date(body.startDate),
        new Date(body.endDate),
        body.originCountry,
        body.destinationCountry,
        body.shipmentType,
      );
      expect(result).toEqual(summaryData);
    });
  });

  describe('generateCustomsDocuments', () => {
    it('should call service to generate customs documents report', async () => {
      const reportId = '1';
      const body = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        originCountry: 'US',
        destinationCountry: 'CA',
        shipmentType: 'air',
      };

      const documentsData = { documents: [] };
      service.generateCustomsDocumentsReport.mockResolvedValue(documentsData);

      const result = await controller.generateCustomsDocuments(reportId, body);

      expect(service.generateCustomsDocumentsReport).toHaveBeenCalledWith(
        new Date(body.startDate),
        new Date(body.endDate),
        body.originCountry,
        body.destinationCountry,
        body.shipmentType,
      );
      expect(result).toEqual(documentsData);
    });
  });

  describe('generateComplianceChecks', () => {
    it('should call service to generate compliance checks report', async () => {
      const reportId = '1';
      const body = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        originCountry: 'US',
        destinationCountry: 'CA',
        shipmentType: 'air',
      };

      const checksData = { checks: [] };
      service.generateComplianceChecksReport.mockResolvedValue(checksData);

      const result = await controller.generateComplianceChecks(reportId, body);

      expect(service.generateComplianceChecksReport).toHaveBeenCalledWith(
        new Date(body.startDate),
        new Date(body.endDate),
        body.originCountry,
        body.destinationCountry,
        body.shipmentType,
      );
      expect(result).toEqual(checksData);
    });
  });
});