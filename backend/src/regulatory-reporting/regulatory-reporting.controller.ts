import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RegulatoryReportingService } from './regulatory-reporting.service';
import { RegulatoryReport, ReportType, ReportFormat } from './entities/regulatory-report.entity';

@ApiTags('Regulatory Reporting')
@Controller('regulatory-reports')
export class RegulatoryReportingController {
  constructor(private readonly service: RegulatoryReportingService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new regulatory report' })
  @ApiResponse({ status: 201, description: 'Report generation started successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        type: { 
          type: 'string', 
          enum: [
            'compliance_summary', 
            'customs_documents', 
            'compliance_checks', 
            'regulatory_overview',
            'shipment_compliance'
          ] 
        },
        format: { type: 'string', enum: ['csv', 'pdf'] },
        startDate: { type: 'string', format: 'date-time' },
        endDate: { type: 'string', format: 'date-time' },
        originCountry: { type: 'string' },
        destinationCountry: { type: 'string' },
        shipmentType: { type: 'string' },
        shipmentId: { type: 'string' },
      },
      required: ['title', 'type', 'format', 'startDate', 'endDate'],
    },
  })
  async generateReport(@Body() createReportDto: any) {
    return this.service.createReport(createReportDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all regulatory reports with filtering' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  @ApiQuery({ name: 'type', required: false, enum: ['compliance_summary', 'customs_documents', 'compliance_checks', 'regulatory_overview', 'shipment_compliance'] })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'pdf'] })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'generating', 'completed', 'failed'] })
  async findAllReports(@Query() query: any) {
    return this.service.findAllReports(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get regulatory report by ID' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findReportById(@Param('id') id: string) {
    return this.service.findReportById(id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export regulatory report in specified format' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'pdf'], description: 'Export format (overrides report format)' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async exportReport(
    @Param('id') id: string,
    @Query('format') format?: ReportFormat,
    @Res() res?: Response,
  ) {
    const report = await this.service.findReportById(id);
    
    // Determine export format
    const exportFormat = format || report.format;
    
    // Generate report data based on report type
    let reportData: any;
    const startDate = report.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    const endDate = report.endDate || new Date();
    
    switch (report.type) {
      case ReportType.COMPLIANCE_SUMMARY:
        reportData = await this.service.generateComplianceSummaryReport(
          startDate,
          endDate,
          report.originCountry,
          report.destinationCountry,
          report.shipmentType,
        );
        break;
      case ReportType.CUSTOMS_DOCUMENTS:
        reportData = await this.service.generateCustomsDocumentsReport(
          startDate,
          endDate,
          report.originCountry,
          report.destinationCountry,
          report.shipmentType,
        );
        break;
      case ReportType.COMPLIANCE_CHECKS:
        reportData = await this.service.generateComplianceChecksReport(
          startDate,
          endDate,
          report.originCountry,
          report.destinationCountry,
          report.shipmentType,
        );
        break;
      default:
        throw new Error('Unsupported report type');
    }
    
    // Export based on format
    if (exportFormat === ReportFormat.CSV) {
      const csvData = await this.service.exportToCSV(reportData, report.type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title}.csv"`);
      return res.send(csvData);
    } else {
      const pdfData = await this.service.exportToPDF(reportData, report.type);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title}.pdf"`);
      return res.send(pdfData);
    }
  }

  @Post(':id/generate-summary')
  @ApiOperation({ summary: 'Generate compliance summary report' })
  @ApiResponse({ status: 200, description: 'Compliance summary generated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async generateComplianceSummary(
    @Param('id') id: string,
    @Body() body: { startDate: string; endDate: string; originCountry?: string; destinationCountry?: string; shipmentType?: string },
  ) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    return this.service.generateComplianceSummaryReport(
      startDate,
      endDate,
      body.originCountry,
      body.destinationCountry,
      body.shipmentType,
    );
  }

  @Post(':id/generate-documents')
  @ApiOperation({ summary: 'Generate customs documents report' })
  @ApiResponse({ status: 200, description: 'Customs documents report generated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async generateCustomsDocuments(
    @Param('id') id: string,
    @Body() body: { startDate: string; endDate: string; originCountry?: string; destinationCountry?: string; shipmentType?: string },
  ) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    return this.service.generateCustomsDocumentsReport(
      startDate,
      endDate,
      body.originCountry,
      body.destinationCountry,
      body.shipmentType,
    );
  }

  @Post(':id/generate-checks')
  @ApiOperation({ summary: 'Generate compliance checks report' })
  @ApiResponse({ status: 200, description: 'Compliance checks report generated successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async generateComplianceChecks(
    @Param('id') id: string,
    @Body() body: { startDate: string; endDate: string; originCountry?: string; destinationCountry?: string; shipmentType?: string },
  ) {
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    
    return this.service.generateComplianceChecksReport(
      startDate,
      endDate,
      body.originCountry,
      body.destinationCountry,
      body.shipmentType,
    );
  }
}