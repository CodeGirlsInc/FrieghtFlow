import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import {
  ApiKeyResponseDto,
  CreateApiKeyResponseDto,
} from './dto/api-key-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('api-keys')
@ApiBearerAuth()
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API key (returned once only)' })
  @ApiResponse({
    status: 201,
    type: CreateApiKeyResponseDto,
    description:
      'Key created — store the full key now, it will not be shown again',
  })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResponseDto> {
    const { key, apiKey } = await this.apiKeysService.create(user.id, dto);
    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      key,
      expiresAt: apiKey.expiresAt,
      lastUsedAt: apiKey.lastUsedAt,
      createdAt: apiKey.createdAt,
    };
  }

  @Get()
  @ApiOperation({
    summary: "List caller's API keys (prefix only, no full key)",
  })
  @ApiResponse({ status: 200, type: [ApiKeyResponseDto] })
  findAll(@CurrentUser() user: User): Promise<ApiKeyResponseDto[]> {
    return this.apiKeysService.findAll(user.id) as Promise<ApiKeyResponseDto[]>;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke an API key (owner or admin only)' })
  @ApiResponse({ status: 204, description: 'Key revoked' })
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.apiKeysService.revoke(id, user.id, user.role === UserRole.ADMIN);
  }
}
