import { Controller, Get, Patch, Param, Body, Query, ParseUUIDPipe, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CertificationReviewService } from './certification-review.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin/certifications')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class CertificationReviewController {
  constructor(private readonly service: CertificationReviewService) {}

  @Get()
  @ApiOperation({ summary: 'List pending certifications' })
  findPending(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findPending(page, limit);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a carrier certification' })
  approve(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.service.approve(id, user.id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a carrier certification with reason' })
  reject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User, @Body('reason') reason: string) {
    if (!reason) throw new BadRequestException('Rejection reason is required');
    return this.service.reject(id, user.id, reason);
  }
}
