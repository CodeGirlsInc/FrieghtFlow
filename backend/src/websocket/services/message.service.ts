import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageHistoryQueryDto } from '../dto/message-history-query.dto';
import { MessageResponseDto } from '../dto/message-response.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createMessage(
    createMessageDto: CreateMessageDto,
    senderId: string,
  ): Promise<MessageResponseDto> {
    const message = this.messageRepository.create({
      freightJobId: createMessageDto.freightJobId,
      senderId,
      messageContent: this.sanitizeMessage(createMessageDto.messageContent),
    });

    const savedMessage = await this.messageRepository.save(message);
    return this.toResponseDto(savedMessage);
  }

  async getMessageHistory(
    freightJobId: string,
    query: MessageHistoryQueryDto,
  ): Promise<{
    messages: MessageResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { freightJobId },
      order: { sentAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      messages: messages.map((msg) => this.toResponseDto(msg)).reverse(), // Reverse to show oldest first
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markMessagesAsRead(
    freightJobId: string,
    userId: string,
  ): Promise<void> {
    await this.messageRepository.update(
      {
        freightJobId,
        senderId: Not(userId), // Messages not sent by the user
        isRead: false,
      },
      { isRead: true },
    );
  }

  async getUnreadCount(freightJobId: string, userId: string): Promise<number> {
    return this.messageRepository.count({
      where: {
        freightJobId,
        senderId: Not(userId),
        isRead: false,
      },
    });
  }

  private sanitizeMessage(content: string): string {
    // Basic XSS prevention - remove script tags and dangerous HTML
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  private toResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      freightJobId: message.freightJobId,
      senderId: message.senderId,
      messageContent: message.messageContent,
      isRead: message.isRead,
      sentAt: message.sentAt,
    };
  }
}

