import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { QueuesService, QueueStats } from './queues.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/queues')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get BullMQ queue statistics for all queues' })
  @ApiResponse({ status: 200, description: 'Queue stats retrieved' })
  async getStats(): Promise<QueueStats[]> {
    return this.queuesService.getStats();
  }
}
