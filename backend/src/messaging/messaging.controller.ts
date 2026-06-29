import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MessagingService } from './messaging.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  getConversations(@CurrentUser() user: User) {
    return this.messagingService.getConversations(user);
  }

  @Post()
  findOrCreate(@Body() dto: CreateConversationDto, @CurrentUser() user: User) {
    return this.messagingService.findOrCreateConversation(dto, user);
  }

  @Get(':id/messages')
  getMessages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.messagingService.getMessages(id, user, page, limit);
  }

  @Post(':id/messages')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  createMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: User,
  ) {
    return this.messagingService.createMessage(id, dto, user);
  }
}
