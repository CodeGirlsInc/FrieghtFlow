import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BulkShipmentsService } from './bulk-shipments.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { BulkCancelDto, BulkUpdateStatusDto } from './dto/bulk-operations.dto';

@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments/bulk')
@UseGuards(RolesGuard)
@Roles(UserRole.SHIPPER)
export class BulkShipmentsController {
  constructor(private readonly bulkShipmentsService: BulkShipmentsService) {}

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel multiple shipments at once (max 50)' })
  cancel(@CurrentUser() user: User, @Body() dto: BulkCancelDto) {
    return this.bulkShipmentsService.cancel(user.id, dto.ids);
  }

  @Post('update-status')
  @ApiOperation({ summary: 'Update status of multiple shipments at once (max 50)' })
  updateStatus(@CurrentUser() user: User, @Body() dto: BulkUpdateStatusDto) {
    return this.bulkShipmentsService.updateStatus(user.id, dto.ids, dto.status);
  }
}
