import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageHistoryQueryDto } from '../dto/message-history-query.dto';
import { MessageResponseDto } from '../dto/message-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Messages')
@Controller('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({
    status: 201,
    description: 'Message created successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: any,
  ): Promise<MessageResponseDto> {
    const senderId = req.user?.sub || req.user?.id;
    return this.messageService.createMessage(createMessageDto, senderId);
  }

  @Get('freight-job/:jobId')
  @ApiOperation({ summary: 'Get message history for a freight job' })
  @ApiParam({
    name: 'jobId',
    description: 'Freight job ID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Message history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: { $ref: '#/components/schemas/MessageResponseDto' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Freight job not found' })
  async getMessageHistory(
    @Param('jobId') jobId: string,
    @Query() query: MessageHistoryQueryDto,
  ): Promise<{
    messages: MessageResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.messageService.getMessageHistory(jobId, query);
  }
}

