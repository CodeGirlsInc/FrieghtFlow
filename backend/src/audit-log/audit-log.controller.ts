import { Controller, Get, Query } from '@nestjs/common';
import type { AuditLogService } from './audit-log.service';

// Uncomment and adjust these imports based on your auth setup
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';

@Controller('audit')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('logs')
  // @Roles('admin', 'auditor')
  async getLogs(@Query() queryDto: any) {
    const result = await this.auditLogService.findAll(queryDto);

    return {
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        limit: queryDto.limit,
        offset: queryDto.offset,
        hasMore: result.total > queryDto.offset + queryDto.limit,
      },
    };
  }

  @Get('logs/recent')
  // @Roles('admin', 'auditor')
  async getRecentLogs(@Query('limit') limit?: number) {
    const logs = await this.auditLogService.getRecentLogs(limit);

    return {
      success: true,
      data: logs,
    };
  }

  @Get('logs/user/:userId')
  // @Roles('admin', 'auditor')
  async getUserLogs(
    @Query('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    const logs = await this.auditLogService.findByUser(userId, limit);

    return {
      success: true,
      data: logs,
    };
  }

  @Get('logs/entity')
  // @Roles('admin', 'auditor')
  async getEntityLogs(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    const logs = await this.auditLogService.findByEntity(entityType, entityId);

    return {
      success: true,
      data: logs,
    };
  }
}
