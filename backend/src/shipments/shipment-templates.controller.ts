import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ShipmentTemplateService } from './shipment-template.service';
import { ShipmentTemplate } from './entities/shipment-template.entity';
import { CreateShipmentTemplateDto } from './dto/create-shipment-template.dto';
import { UpdateShipmentTemplateDto } from './dto/update-shipment-template.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';

/**
 * Saved shipment drafts, namespaced under `/shipments/templates` so the
 * routes cannot be shadowed by `ShipmentsController`'s `GET /shipments/:id`
 * catch-all. (This controller must also stay registered *before*
 * `ShipmentsController` in the module's `controllers` array — see
 * `ShipmentsModule`.)
 *
 * Templates only make sense for the roles that create shipments, so the
 * role restriction is applied to the whole controller. Per-record
 * ownership is enforced in the service.
 */
@ApiTags('shipments')
@ApiBearerAuth()
@Controller('shipments/templates')
@UseGuards(RolesGuard)
@Roles(UserRole.SHIPPER, UserRole.ADMIN)
export class ShipmentTemplatesController {
  constructor(
    private readonly shipmentTemplateService: ShipmentTemplateService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Save a reusable shipment template' })
  @ApiResponse({ status: 201, description: 'Template created' })
  @ApiResponse({
    status: 409,
    description: 'A template with that name already exists for this user',
  })
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateShipmentTemplateDto,
  ): Promise<ShipmentTemplate> {
    return this.shipmentTemplateService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my shipment templates' })
  findAll(@CurrentUser() user: User): Promise<ShipmentTemplate[]> {
    return this.shipmentTemplateService.findAll(user.id);
  }

  @Get(':id/draft')
  @ApiOperation({
    summary: 'Build a shipment draft from a template',
    description:
      'Returns the template payload with its own fields stripped, ready to ' +
      'pre-fill POST /shipments. Read-only — no shipment is created.',
  })
  buildDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.shipmentTemplateService.buildShipmentFromTemplate(id, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my shipment templates' })
  @ApiResponse({ status: 404, description: 'Template does not exist' })
  @ApiResponse({ status: 403, description: 'Template belongs to another user' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<ShipmentTemplate> {
    return this.shipmentTemplateService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update one of my shipment templates' })
  @ApiResponse({ status: 404, description: 'Template does not exist' })
  @ApiResponse({ status: 403, description: 'Template belongs to another user' })
  @ApiResponse({
    status: 409,
    description: 'A template with that name already exists for this user',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateShipmentTemplateDto,
  ): Promise<ShipmentTemplate> {
    return this.shipmentTemplateService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete one of my shipment templates' })
  @ApiResponse({ status: 404, description: 'Template does not exist' })
  @ApiResponse({ status: 403, description: 'Template belongs to another user' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.shipmentTemplateService.remove(id, user.id);
  }
}
