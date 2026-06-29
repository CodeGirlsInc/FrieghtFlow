import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/entities/user.entity';

export const MESSAGE_NEW = 'message.new';

export interface MessageNewEvent {
  conversationId: string;
  messageId: string;
  recipientId: string;
  senderName: string;
  preview: string;
  createdAt: string;
}

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOrCreateConversation(
    dto: CreateConversationDto,
    currentUser: User,
  ): Promise<Conversation> {
    const shipment = await this.shipmentRepo.findOne({
      where: { id: dto.shipmentId },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');

    const isParty =
      shipment.shipperId === currentUser.id ||
      shipment.carrierId === currentUser.id;
    if (!isParty) {
      throw new ForbiddenException(
        'Only the shipper or carrier can access this conversation',
      );
    }

    const existing = await this.conversationRepo.findOne({
      where: { shipmentId: dto.shipmentId },
    });
    if (existing) return existing;

    if (!shipment.carrierId) {
      throw new BadRequestException(
        'Conversation cannot be created until a carrier is assigned',
      );
    }

    const conversation = this.conversationRepo.create({
      shipmentId: shipment.id,
      shipperId: shipment.shipperId,
      carrierId: shipment.carrierId,
    });
    return this.conversationRepo.save(conversation);
  }

  async getConversations(currentUser: User): Promise<
    {
      id: string;
      shipmentId: string;
      lastMessage: string | null;
      lastMessageAt: Date | null;
      unreadCount: number;
    }[]
  > {
    const conversations = await this.conversationRepo.find({
      where: [{ shipperId: currentUser.id }, { carrierId: currentUser.id }],
      order: { lastMessageAt: 'DESC' },
    });

    return Promise.all(
      conversations.map(async (conv) => {
        const lastMsg = await this.messageRepo.findOne({
          where: { conversationId: conv.id },
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.messageRepo.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderId:
              conv.shipperId === currentUser.id
                ? conv.carrierId
                : conv.shipperId,
          },
        });

        return {
          id: conv.id,
          shipmentId: conv.shipmentId,
          lastMessage: lastMsg ? lastMsg.body.substring(0, 80) : null,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      }),
    );
  }

  async getMessages(
    conversationId: string,
    currentUser: User,
    page = 1,
    limit = 50,
  ): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParty =
      conversation.shipperId === currentUser.id ||
      conversation.carrierId === currentUser.id;
    if (!isParty) throw new ForbiddenException('Access denied');

    // Mark unread messages from the other party as read
    const otherPartyId =
      conversation.shipperId === currentUser.id
        ? conversation.carrierId
        : conversation.shipperId;

    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true, readAt: new Date() })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id = :otherPartyId', { otherPartyId })
      .andWhere('is_read = false')
      .execute();

    const [data, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async createMessage(
    conversationId: string,
    dto: CreateMessageDto,
    currentUser: User,
  ): Promise<Message> {
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['shipper', 'carrier'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    const isParty =
      conversation.shipperId === currentUser.id ||
      conversation.carrierId === currentUser.id;
    if (!isParty) throw new ForbiddenException('Access denied');

    const message = this.messageRepo.create({
      conversationId,
      senderId: currentUser.id,
      body: dto.body,
    });
    const saved = await this.messageRepo.save(message);

    // Update conversation lastMessageAt
    await this.conversationRepo.update(conversationId, {
      lastMessageAt: saved.createdAt,
    });

    // Determine recipient
    const recipientId =
      conversation.shipperId === currentUser.id
        ? conversation.carrierId
        : conversation.shipperId;

    const senderName = `${currentUser.firstName} ${currentUser.lastName}`;

    this.eventEmitter.emit(MESSAGE_NEW, {
      conversationId,
      messageId: saved.id,
      recipientId,
      senderName,
      preview: dto.body.substring(0, 80),
      createdAt: saved.createdAt.toISOString(),
    } satisfies MessageNewEvent);

    return saved;
  }
}
