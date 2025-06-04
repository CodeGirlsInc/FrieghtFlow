import { Controller, Get, Query, UseGuards } from "@nestjs/common"
import type { TransactionReportService } from "../services/transaction-report.service"
import type { TransactionReportDto } from "../dto/transaction-report.dto"
import { ApiKeyGuard } from "../../common/guards/api-key.guard"

@Controller("transaction-reports")
@UseGuards(ApiKeyGuard)
export class TransactionReportController {
  constructor(private readonly transactionReportService: TransactionReportService) {}

  @Get("summary")
  async getTransactionSummary(@Query() reportDto: TransactionReportDto) {
    return this.transactionReportService.generateSummaryReport(reportDto);
  }

  @Get("volume")
  async getTransactionVolume(@Query() reportDto: TransactionReportDto) {
    return this.transactionReportService.generateVolumeReport(reportDto);
  }

  @Get("status-breakdown")
  async getStatusBreakdown(@Query() reportDto: TransactionReportDto) {
    return this.transactionReportService.generateStatusBreakdownReport(reportDto);
  }

  @Get("gateway-breakdown")
  async getGatewayBreakdown(@Query() reportDto: TransactionReportDto) {
    return this.transactionReportService.generateGatewayBreakdownReport(reportDto);
  }

  @Get("time-series")
  async getTimeSeries(@Query() reportDto: TransactionReportDto) {
    return this.transactionReportService.generateTimeSeriesReport(reportDto);
  }
}
