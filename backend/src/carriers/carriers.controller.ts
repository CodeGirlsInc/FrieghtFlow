import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CarriersService } from './carriers.service';
import { CarrierCertificationsService } from './carrier-certifications.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { CreateCarrierCertificationDto } from './dto/carrier-certification.dto';

@ApiTags('carriers')
@ApiBearerAuth()
@Controller('carriers')
export class CarriersController {
  constructor(
    private readonly carriersService: CarriersService,
    private readonly certificationsService: CarrierCertificationsService,
  ) {}

  @Get('me/metrics')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER)
  @ApiOperation({ summary: 'Get performance metrics for the authenticated carrier' })
  getMyMetrics(@CurrentUser() user: User) {
    return this.carriersService.getMyMetrics(user.id);
  }

  // ── Certification endpoints ──────────────────────────────────────────────────

  @Post('me/certifications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER)
  @ApiOperation({ summary: 'Upload a new certification (Carrier only)' })
  createCertification(
    @CurrentUser() user: User,
    @Body() dto: CreateCarrierCertificationDto,
  ) {
    return this.certificationsService.create(user.id, dto);
  }

  @Get('me/certifications')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER)
  @ApiOperation({ summary: 'Get my certifications' })
  getMyCertifications(@CurrentUser() user: User) {
    return this.certificationsService.findByCarrierId(user.id);
  }

  @Get(':id/certifications')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get certifications for a carrier (visible to all authenticated users)' })
  getCarrierCertifications(@Param('id', ParseUUIDPipe) id: string) {
    return this.certificationsService.findByCarrierId(id);
  }

  @Delete('me/certifications/:certId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CARRIER)
  @ApiOperation({ summary: 'Delete my certification' })
  deleteCertification(
    @CurrentUser() user: User,
    @Param('certId', ParseUUIDPipe) certId: string,
  ) {
    return this.certificationsService.delete(certId, user.id);
  }
}
