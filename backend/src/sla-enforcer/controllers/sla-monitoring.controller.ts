import { Controller, Get, Post, Param, Query, HttpCode, HttpStatus } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger"
import type { SLAMonitoringService } from "../services/sla-monitoring.service"
import type { SLAActionService } from "../services/sla-action.service"
import type { SLAMonitoringQueryDto } from "../dto/sla-monitoring-query.dto"
import type {
  SLAMonitoringResult,
  SLAViolationSummary,
  ActionExecutionResult,
} from "../interfaces/sla-enforcer.interface"

@ApiTags("SLA Monitoring")
@Controller("sla-monitoring")
export class SLAMonitoringController {
  constructor(
    private readonly slaMonitoringService: SLAMonitoringService,
    private readonly slaActionService: SLAActionService,
  ) {}

  @Post("run-monitoring")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Manually trigger SLA monitoring" })
  @ApiResponse({ status: 200, description: "SLA monitoring completed" })
  async runMonitoring(): Promise<SLAMonitoringResult[]> {
    return this.slaMonitoringService.monitorAllShipments()
  }

  @Get("results")
  @ApiOperation({ summary: "Get SLA monitoring results" })
  @ApiResponse({ status: 200, description: "Monitoring results retrieved" })
  async getMonitoringResults(@Query() query: SLAMonitoringQueryDto): Promise<SLAMonitoringResult[]> {
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined
    const toDate = query.toDate ? new Date(query.toDate) : undefined
    
    return this.slaMonitoringService.getMonitoringResults(
      query.shipmentId,
      undefined, // ruleId not in query interface
      fromDate,
      toDate
    )
  }

  @Get("violations/summary")
  @ApiOperation({ summary: "Get SLA violations summary" })
  @ApiResponse({ status: 200, description: "Violations summary retrieved" })
  async getViolationsSummary(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<SLAViolationSummary> {
    const from = fromDate ? new Date(fromDate) : undefined
    const to = toDate ? new Date(toDate) : undefined

    return this.slaMonitoringService.getViolationSummary(from, to)
  }

  @Post("violations/:violationId/retrigger-actions")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Retrigger actions for an SLA violation" })
  @ApiParam({ name: "violationId", description: "SLA violation ID" })
  @ApiResponse({ status: 200, description: "Actions retriggered successfully" })
  @ApiResponse({ status: 404, description: "Violation not found" })
  async retriggerActions(@Param('violationId') violationId: string): Promise<ActionExecutionResult[]> {
    return this.slaActionService.retriggerActions(violationId)
  }
}
