import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import { CreateWebhookDto } from './dto/create-webhook.dto';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@ApiBearerAuth()
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Register a webhook URL for shipment status changes',
  })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  create(@CurrentUser() user: User, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.create(user.id, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({ summary: 'List my registered webhooks' })
  findAll(@CurrentUser() user: User) {
    return this.webhooksService.findAllForUser(user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHIPPER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete one of my registered webhooks' })
  @ApiResponse({ status: 204, description: 'Webhook deleted' })
  async remove(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.webhooksService.remove(user.id, id);
  }
}
