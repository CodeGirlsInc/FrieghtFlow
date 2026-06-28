import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminStatsService } from './admin-stats.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('admin/stats')
@Roles(UserRole.ADMIN)
@UseGuards(RolesGuard)
export class AdminStatsController {
  constructor(private readonly adminStatsService: AdminStatsService) {}

  @Get()
  async getStats() {
    return await this.adminStatsService.getStats();
  }
}
