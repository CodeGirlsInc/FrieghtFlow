import { Controller, Get, Post, Body } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { LoggerService } from "../services/logger.service"
import type { MetricsService } from "../services/metrics.service"
import type { DatabaseTransport } from "../transports/database.transport"
import { LogLevel } from "../interfaces/logger.interface"

@ApiTags("Logger")
@Controller("api/logger")
@ApiBearerAuth()
export class LoggerController {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly metricsService: MetricsService,
    private readonly databaseTransport: DatabaseTransport,
  ) {}

  @Get("health")
  @ApiOperation({ summary: "Check logger health status" })
  @ApiResponse({ status: 200, description: "Logger health status" })
  async getHealth() {
    return await this.loggerService.healthCheck()
  }

  @Get("metrics")
  @ApiOperation({ summary: "Get logging metrics" })
  @ApiResponse({ status: 200, description: "Logging metrics" })
  getMetrics() {
    return this.loggerService.getDetailedMetrics()
  }

  @Get("metrics/export")
  @ApiOperation({ summary: "Export metrics in Prometheus format" })
  @ApiResponse({ status: 200, description: "Prometheus metrics", type: String })
  exportMetrics() {
    return this.metricsService.exportMetrics()
  }

  @Get("logs/statistics")
  @ApiOperation({ summary: "Get log statistics" })
  @ApiResponse({ status: 200, description: "Log statistics" })
  async getLogStatistics() {
    return await this.databaseTransport.getLogStatistics()
  }

  @Post('logs/archive')
  @ApiOperation({ summary: 'Archive old logs' })
  @ApiResponse({ status: 200, description: 'Number of logs archived' })
  async archiveLogs(@Body() body: { daysOld: number }) {
    const daysOld = body.daysOld || 30;
    const archivedCount = await this.databaseTransport.archiveOldLogs(daysOld);
    
    this.loggerService.audit('ARCHIVE_LOGS', 'logs', {
      operation: 'archive',
      daysOld,
      archivedCount,
    });

    return { archivedCount };
  }

  @Post('logs/cleanup')
  @ApiOperation({ summary: 'Delete archived logs' })
  @ApiResponse({ status: 200, description: 'Number of logs deleted' })
  async cleanupLogs(@Body() body: { daysOld: number }) {
    const daysOld = body.daysOld || 90;
    const deletedCount = await this.databaseTransport.deleteArchivedLogs(daysOld);
    
    this.loggerService.audit('CLEANUP_LOGS', 'logs', {
      operation: 'cleanup',
      daysOld,
      deletedCount,
    });

    return { deletedCount };
  }

  @Post('test')
  @ApiOperation({ summary: 'Test logging functionality' })
  @ApiResponse({ status: 200, description: 'Test results' })
  testLogging(@Body() testData: { level: LogLevel; message: string; includeError?: boolean }) {
    const { level, message, includeError } = testData;
    
    const context = {
      module: 'LoggerController',
      component: 'testLogging',
      operation: 'test',
      tags: ['test'],
    };

    switch (level) {
      case LogLevel.DEBUG:
        this.loggerService.debug(message, context);
        break;
      case LogLevel.INFO:
        this.loggerService.info(message, context);
        break;
      case LogLevel.WARN:
        this.loggerService.warn(message, context);
        break;
      case LogLevel.ERROR:
        const error = includeError ? new Error('Test error') : undefined;
        this.loggerService.error(message, error, context);
        break;
      case LogLevel.FATAL:
        const fatalError = includeError ? new Error('Test fatal error') : undefined;
        this.loggerService.fatal(message, fatalError, context);
        break;
      default:
        this.loggerService.info(message, context);
    }

    return { success: true, level, message };
  }

  @Post("flush")
  @ApiOperation({ summary: "Flush all log buffers" })
  @ApiResponse({ status: 200, description: "Buffers flushed successfully" })
  async flushBuffers() {
    await this.loggerService.flush()

    this.loggerService.audit("FLUSH_BUFFERS", "logger", {
      operation: "flush",
    })

    return { success: true, message: "All log buffers flushed successfully" }
  }

  @Get("config")
  @ApiOperation({ summary: "Get current logger configuration" })
  @ApiResponse({ status: 200, description: "Current logger configuration" })
  getConfig() {
    return {
      level: this.loggerService["config"].level,
      format: this.loggerService["config"].format,
      transports: this.loggerService["config"].transports.filter((t) => t.enabled),
      enableMetrics: this.loggerService["config"].enableMetrics,
      enableTracing: this.loggerService["config"].enableTracing,
    }
  }
}
