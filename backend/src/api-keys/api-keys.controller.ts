import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

class CreateApiKeyDto {
  name: string;
}

@ApiTags('api-keys')
@ApiBearerAuth()
@Controller('api-keys')
@UseGuards(RolesGuard)
@Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.ADMIN)
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  @ApiResponse({
    status: 201,
    description:
      'API key created — store the raw key, it will not be shown again',
  })
  async create(@CurrentUser() user: User, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.create(user.id, dto.name);
  }

  @Get()
  @ApiOperation({ summary: 'List my API keys' })
  @ApiResponse({ status: 200 })
  findAll(@CurrentUser() user: User) {
    return this.apiKeysService.findAllForUser(user.id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Revoke an API key' })
  @ApiResponse({ status: 204 })
  async revoke(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.apiKeysService.revoke(user.id, id);
  }
}
