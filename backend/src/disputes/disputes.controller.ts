import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { ResolveDisputeDto } from './dto/resolve-dispute.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { DisputeStatus } from './entities/dispute.entity';

@ApiTags('disputes')
@ApiBearerAuth()
@Controller()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post('disputes')
  @ApiOperation({ summary: 'Open a dispute on a shipment' })
  create(@CurrentUser() user: User, @Body() dto: CreateDisputeDto) {
    return this.disputesService.create(user.id, dto);
  }

  @Get('disputes/:id')
  @ApiOperation({ summary: 'View dispute details' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.disputesService.findOne(id, user.id, user.role);
  }

  @Patch('disputes/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve a dispute (admin only)' })
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.resolve(id, user.id, dto);
  }

  @Get('admin/disputes')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List disputes for admin (filterable by status)' })
  findAllAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: DisputeStatus,
  ) {
    return this.disputesService.findAllAdmin({ page, limit, status });
  }
}
