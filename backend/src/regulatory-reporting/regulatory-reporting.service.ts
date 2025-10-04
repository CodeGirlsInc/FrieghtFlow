import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegulatoryReport, ReportType, ReportFormat, ReportStatus } from './entities/regulatory-report.entity';
import { CustomsDocument } from '../customs/entities/customs-document.entity';
import { ComplianceCheck } from '../customs/entities/compliance-check.entity';
import { CustomsRequirement } from '../customs/entities/customs-requirement.entity';

@Injectable()
export class RegulatoryReportingService {
  constructor(
    @InjectRepository(RegulatoryReport)
    private reportRepository: Repository<RegulatoryReport>,
    @InjectRepository(CustomsDocument)
    private documentRepository: Repository<CustomsDocument>,
    @InjectRepository(ComplianceCheck)
    private checkRepository: Repository<ComplianceCheck>,
    @InjectRepository(CustomsRequirement)
    private requirementRepository: Repository<CustomsRequirement>,
  ) {}

  async createReport(createReportDto: any): Promise<RegulatoryReport> {
    const report = this.reportRepository.create({
      ...createReportDto,
      status: ReportStatus.PENDING,
    });
    
    return this.reportRepository.save(report);
  }

  async findAllReports(filters: any = {}): Promise<RegulatoryReport[]> {
    return this.reportRepository.find({
      where: filters,
      order: { createdAt: 'DESC' },
    });
  }

  async findReportById(id: string): Promise<RegulatoryReport> {
    const report = await this.reportRepository.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    return report;
  }

  async updateReport(id: string, updateData: any): Promise<RegulatoryReport> {
    const report = await this.findReportById(id);
    Object.assign(report, updateData);
    return this.reportRepository.save(report);
  }

  async deleteReport(id: string): Promise<void> {
    const report = await this.findReportById(id);
    await this.reportRepository.remove(report);
  }

  async generateComplianceSummaryReport(
    startDate: Date,
    endDate: Date,
    originCountry?: string,
    destinationCountry?: string,
    shipmentType?: string,
  ): Promise<any> {
    // Build query filters
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (originCountry) {
      where.originCountry = originCountry;
    }

    if (destinationCountry) {
      where.destinationCountry = destinationCountry;
    }

    if (shipmentType) {
      where.shipmentType = shipmentType;
    }

    try {
      // Get compliance data
      const [documents, checks, requirements] = await Promise.all([
        this.documentRepository.find({ where }),
        this.checkRepository.find({ where }),
        this.requirementRepository.find(),
      ]);

      // Calculate statistics
      const totalDocuments = documents.length;
      const approvedDocuments = documents.filter((d: CustomsDocument) => d.status === 'approved').length;
      const rejectedDocuments = documents.filter((d: CustomsDocument) => d.status === 'rejected').length;
      const pendingDocuments = documents.filter((d: CustomsDocument) => d.status === 'pending').length;

      const totalChecks = checks.length;
      const passedChecks = checks.filter((c: ComplianceCheck) => c.status === 'passed').length;
      const failedChecks = checks.filter((c: ComplianceCheck) => c.status === 'failed').length;
      const pendingChecks = checks.filter((c: ComplianceCheck) => c.status === 'pending').length;

      const complianceRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0;
      const documentApprovalRate = totalDocuments > 0 ? (approvedDocuments / totalDocuments) * 100 : 0;

      // Group by requirement type
      const requirementStats: any = {};
      requirements.forEach((req: CustomsRequirement) => {
        if (!requirementStats[req.type]) {
          requirementStats[req.type] = {
            total: 0,
            mandatory: 0,
            active: 0,
          };
        }
        requirementStats[req.type].total++;
        if (req.isMandatory) requirementStats[req.type].mandatory++;
        if (req.status === 'active') requirementStats[req.type].active++;
      });

      return {
        period: {
          startDate,
          endDate,
        },
        summary: {
          totalDocuments,
          approvedDocuments,
          rejectedDocuments,
          pendingDocuments,
          documentApprovalRate: documentApprovalRate.toFixed(2),
          totalChecks,
          passedChecks,
          failedChecks,
          pendingChecks,
          complianceRate: complianceRate.toFixed(2),
        },
        requirementStats,
        filters: {
          originCountry,
          destinationCountry,
          shipmentType,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate compliance summary report');
    }
  }

  async generateCustomsDocumentsReport(
    startDate: Date,
    endDate: Date,
    originCountry?: string,
    destinationCountry?: string,
    shipmentType?: string,
  ): Promise<any> {
    // Build query filters
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (originCountry) {
      where.originCountry = originCountry;
    }

    if (destinationCountry) {
      where.destinationCountry = destinationCountry;
    }

    if (shipmentType) {
      where.shipmentType = shipmentType;
    }

    try {
      const documents = await this.documentRepository.find({
        where,
        relations: ['requirement'],
        order: { createdAt: 'DESC' },
      });

      return {
        period: {
          startDate,
          endDate,
        },
        documents: documents.map((doc: CustomsDocument) => ({
          id: doc.id,
          shipmentId: doc.shipmentId,
          documentType: doc.documentType,
          status: doc.status,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          requirement: doc.requirement ? {
            code: doc.requirement.requirementCode,
            name: doc.requirement.name,
            type: doc.requirement.type,
          } : null,
        })),
        filters: {
          originCountry,
          destinationCountry,
          shipmentType,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate customs documents report');
    }
  }

  async generateComplianceChecksReport(
    startDate: Date,
    endDate: Date,
    originCountry?: string,
    destinationCountry?: string,
    shipmentType?: string,
  ): Promise<any> {
    // Build query filters
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (originCountry) {
      where.originCountry = originCountry;
    }

    if (destinationCountry) {
      where.destinationCountry = destinationCountry;
    }

    if (shipmentType) {
      where.shipmentType = shipmentType;
    }

    try {
      const checks = await this.checkRepository.find({
        where,
        relations: ['requirement'],
        order: { createdAt: 'DESC' },
      });

      return {
        period: {
          startDate,
          endDate,
        },
        checks: checks.map((check: ComplianceCheck) => ({
          id: check.id,
          shipmentId: check.shipmentId,
          checkType: check.checkType,
          checkName: check.checkName,
          status: check.status,
          priority: check.priority,
          isAutomated: check.isAutomated,
          isMandatory: check.isMandatory,
          performedBy: check.performedBy,
          performedAt: check.performedAt,
          createdAt: check.createdAt,
          updatedAt: check.updatedAt,
          requirement: check.requirement ? {
            code: check.requirement.requirementCode,
            name: check.requirement.name,
            type: check.requirement.type,
          } : null,
        })),
        filters: {
          originCountry,
          destinationCountry,
          shipmentType,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate compliance checks report');
    }
  }

  async exportToCSV(data: any, reportType: ReportType): Promise<string> {
    try {
      let csvContent = '';
      
      // Add headers based on report type
      switch (reportType) {
        case ReportType.COMPLIANCE_SUMMARY:
          csvContent += 'Metric,Value\n';
          csvContent += `Total Documents,${data.summary.totalDocuments}\n`;
          csvContent += `Approved Documents,${data.summary.approvedDocuments}\n`;
          csvContent += `Rejected Documents,${data.summary.rejectedDocuments}\n`;
          csvContent += `Pending Documents,${data.summary.pendingDocuments}\n`;
          csvContent += `Document Approval Rate,${data.summary.documentApprovalRate}%\n`;
          csvContent += `Total Checks,${data.summary.totalChecks}\n`;
          csvContent += `Passed Checks,${data.summary.passedChecks}\n`;
          csvContent += `Failed Checks,${data.summary.failedChecks}\n`;
          csvContent += `Pending Checks,${data.summary.pendingChecks}\n`;
          csvContent += `Compliance Rate,${data.summary.complianceRate}%\n`;
          break;
          
        case ReportType.CUSTOMS_DOCUMENTS:
          csvContent += 'ID,Shipment ID,Document Type,Status,File Name,Created At,Updated At\n';
          data.documents.forEach((doc: any) => {
            csvContent += `"${doc.id}","${doc.shipmentId}","${doc.documentType}","${doc.status}","${doc.fileName || ''}","${doc.createdAt}","${doc.updatedAt}"\n`;
          });
          break;
          
        case ReportType.COMPLIANCE_CHECKS:
          csvContent += 'ID,Shipment ID,Check Type,Check Name,Status,Priority,Is Automated,Is Mandatory,Performed By,Performed At,Created At,Updated At\n';
          data.checks.forEach((check: any) => {
            csvContent += `"${check.id}","${check.shipmentId}","${check.checkType}","${check.checkName}","${check.status}","${check.priority}","${check.isAutomated}","${check.isMandatory}","${check.performedBy || ''}","${check.performedAt || ''}","${check.createdAt}","${check.updatedAt}"\n`;
          });
          break;
          
        default:
          throw new Error('Unsupported report type for CSV export');
      }
      
      return csvContent;
    } catch (error) {
      throw new InternalServerErrorException('Failed to export report to CSV');
    }
  }

  async exportToPDF(data: any, reportType: ReportType): Promise<any> {
    try {
      // For this implementation without additional dependencies,
      // we'll create a simple text-based PDF representation
      let pdfContent = `Regulatory Report - ${reportType}\n\n`;
      pdfContent += `Generated on: ${new Date().toISOString()}\n\n`;
      
      switch (reportType) {
        case ReportType.COMPLIANCE_SUMMARY:
          pdfContent += 'COMPLIANCE SUMMARY REPORT\n';
          pdfContent += '========================\n\n';
          pdfContent += `Period: ${data.period.startDate} to ${data.period.endDate}\n\n`;
          pdfContent += 'Summary:\n';
          pdfContent += `  Total Documents: ${data.summary.totalDocuments}\n`;
          pdfContent += `  Approved Documents: ${data.summary.approvedDocuments}\n`;
          pdfContent += `  Rejected Documents: ${data.summary.rejectedDocuments}\n`;
          pdfContent += `  Pending Documents: ${data.summary.pendingDocuments}\n`;
          pdfContent += `  Document Approval Rate: ${data.summary.documentApprovalRate}%\n`;
          pdfContent += `  Total Checks: ${data.summary.totalChecks}\n`;
          pdfContent += `  Passed Checks: ${data.summary.passedChecks}\n`;
          pdfContent += `  Failed Checks: ${data.summary.failedChecks}\n`;
          pdfContent += `  Pending Checks: ${data.summary.pendingChecks}\n`;
          pdfContent += `  Compliance Rate: ${data.summary.complianceRate}%\n`;
          break;
          
        case ReportType.CUSTOMS_DOCUMENTS:
          pdfContent += 'CUSTOMS DOCUMENTS REPORT\n';
          pdfContent += '========================\n\n';
          pdfContent += `Period: ${data.period.startDate} to ${data.period.endDate}\n\n`;
          pdfContent += 'Documents:\n';
          data.documents.forEach((doc: any, index: number) => {
            pdfContent += `\n${index + 1}. ${doc.documentType}\n`;
            pdfContent += `   ID: ${doc.id}\n`;
            pdfContent += `   Shipment ID: ${doc.shipmentId}\n`;
            pdfContent += `   Status: ${doc.status}\n`;
            pdfContent += `   File Name: ${doc.fileName || 'N/A'}\n`;
            pdfContent += `   Created: ${doc.createdAt}\n`;
          });
          break;
          
        case ReportType.COMPLIANCE_CHECKS:
          pdfContent += 'COMPLIANCE CHECKS REPORT\n';
          pdfContent += '========================\n\n';
          pdfContent += `Period: ${data.period.startDate} to ${data.period.endDate}\n\n`;
          pdfContent += 'Checks:\n';
          data.checks.forEach((check: any, index: number) => {
            pdfContent += `\n${index + 1}. ${check.checkName}\n`;
            pdfContent += `   ID: ${check.id}\n`;
            pdfContent += `   Shipment ID: ${check.shipmentId}\n`;
            pdfContent += `   Type: ${check.checkType}\n`;
            pdfContent += `   Status: ${check.status}\n`;
            pdfContent += `   Priority: ${check.priority}\n`;
            pdfContent += `   Automated: ${check.isAutomated ? 'Yes' : 'No'}\n`;
            pdfContent += `   Mandatory: ${check.isMandatory ? 'Yes' : 'No'}\n`;
            pdfContent += `   Performed By: ${check.performedBy || 'N/A'}\n`;
            pdfContent += `   Performed At: ${check.performedAt || 'N/A'}\n`;
            pdfContent += `   Created: ${check.createdAt}\n`;
          });
          break;
          
        default:
          throw new Error('Unsupported report type for PDF export');
      }
      
      // Convert string to buffer (simulating PDF generation)
      return pdfContent;
    } catch (error) {
      throw new InternalServerErrorException('Failed to export report to PDF');
    }
  }
}