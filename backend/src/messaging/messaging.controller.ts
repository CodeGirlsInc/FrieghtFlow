import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { MessagingService } from './messaging.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

class StartConversationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shipmentId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  carrierId: string;
}

class SendMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  body: string;
}

@ApiTags('messaging')
@ApiBearerAuth()
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post()
  @ApiOperation({ summary: 'Start or fetch a conversation for a shipment' })
  async startConversation(
    @CurrentUser() user: User,
    @Body() dto: StartConversationDto,
  ) {
    return this.messagingService.findOrCreateConversation(
      dto.shipmentId,
      user.id,
      dto.carrierId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List current user conversations' })
  async listConversations(@CurrentUser() user: User) {
    return this.messagingService.listConversations(user.id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  async sendMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(id, user.id, dto.body);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get paginated message history' })
  async getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? Math.max(1, parseInt(page, 10)) : 1;
    const l = limit ? Math.min(100, Math.max(1, parseInt(limit, 10))) : 50;
    return this.messagingService.getMessages(id, user.id, p, l);
  }
}
