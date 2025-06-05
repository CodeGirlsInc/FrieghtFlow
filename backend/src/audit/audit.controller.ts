import { Controller, Get, Post, Query, Param, Body } from "@nestjs/common"
import type { AuditService } from "./audit.service"
import type { CreateAuditLogDto } from "./dto/create-audit-log.dto"
import type { AuditLogFilterDto } from "./dto/audit-log-filter.dto"

// Assuming you have an admin guard
// @UseGuards(AdminGuard)
@Controller("audit")
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post("logs")
  async createLog(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditService.log(createAuditLogDto)
  }

  @Get("logs")
  async getLogs(@Query() filterDto: AuditLogFilterDto) {
    const filter = {
      ...filterDto,
      startDate: filterDto.startDate ? new Date(filterDto.startDate) : undefined,
      endDate: filterDto.endDate ? new Date(filterDto.endDate) : undefined,
    }

    const result = await this.auditService.findLogs(filter)

    return {
      data: result.logs,
      pagination: {
        page: filterDto.page || 1,
        limit: filterDto.limit || 50,
        total: result.total,
        totalPages: Math.ceil(result.total / (filterDto.limit || 50)),
      },
    }
  }

  @Get("logs/:id")
  async getLogById(@Param("id") id: string) {
    return this.auditService.findLogById(id)
  }

  @Get("users/:userId/logs")
  async getUserLogs(@Param("userId") userId: string, @Query("limit") limit?: number) {
    return this.auditService.findUserLogs(userId, limit ? Number.parseInt(limit.toString()) : undefined)
  }

  @Get("summary")
  async getSummary(@Query("days") days?: number) {
    return this.auditService.getSummary(days ? Number.parseInt(days.toString()) : undefined)
  }

  @Get("critical-events")
  async getCriticalEvents(@Query("hours") hours?: number) {
    return this.auditService.getCriticalEvents(hours ? Number.parseInt(hours.toString()) : undefined)
  }

  @Post("cleanup/expired")
  async cleanupExpiredLogs() {
    const deletedCount = await this.auditService.cleanupExpiredLogs()
    return { message: `Cleaned up ${deletedCount} expired logs` }
  }

  @Post("cleanup/old")
  async cleanupOldLogs(@Query("days") days?: number) {
    const deletedCount = await this.auditService.cleanupOldLogs(days ? Number.parseInt(days.toString()) : undefined)
    return { message: `Cleaned up ${deletedCount} old logs` }
  }
}
