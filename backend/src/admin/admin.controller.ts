import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CarrierCertificationsService } from '../carriers/carrier-certifications.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { QueryAdminShipmentsDto } from './dto/query-admin-shipments.dto';
import { UpdateCertificationVerificationDto } from '../carriers/dto/carrier-certification.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class ChangeRoleDto {
  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;
}

@ApiTags('admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly certificationsService: CarrierCertificationsService,
  ) {}

  // ── Stats ────────────────────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide stats' })
  @ApiResponse({ status: 200, description: 'Platform stats' })
  getStats() {
    return this.adminService.getStats();
  }

  // ── Users ────────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'List all users (paginated, filterable)' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  listUsers(@Query() query: QueryUsersDto) {
    return this.adminService.listUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiResponse({ status: 200, description: 'User data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.findUser(id);
  }

  @Patch('users/:id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a user account' })
  @ApiResponse({ status: 200, description: 'User deactivated' })
  deactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.deactivateUser(id, admin.id);
  }

  @Patch('users/:id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a user account' })
  @ApiResponse({ status: 200, description: 'User activated' })
  activateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.activateUser(id);
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change a user role' })
  @ApiResponse({ status: 200, description: 'Role updated' })
  changeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() admin: User,
  ) {
    return this.adminService.changeUserRole(id, dto.role, admin.id);
  }

  // ── Shipments ────────────────────────────────────────────────────────────────

  @Get('shipments')
  @ApiOperation({
    summary: 'List all shipments (filterable by status and date range)',
  })
  @ApiResponse({ status: 200, description: 'Paginated shipment list' })
  listShipments(@Query() query: QueryAdminShipmentsDto) {
    return this.adminService.listShipments(query);
  }

  // ── Certifications ───────────────────────────────────────────────────────────

  @Patch('certifications/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify or unverify a carrier certification' })
  @ApiResponse({
    status: 200,
    description: 'Certification verification updated',
  })
  @ApiResponse({ status: 404, description: 'Certification not found' })
  verifyCertification(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCertificationVerificationDto,
  ) {
    return this.certificationsService.updateVerification(id, dto);
  }
}
