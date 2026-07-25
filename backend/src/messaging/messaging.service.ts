import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findOrCreateConversation(
    shipmentId: string,
    shipperId: string,
    carrierId: string,
  ): Promise<Conversation> {
    let convo = await this.conversationRepo.findOne({
      where: { shipmentId, shipperId, carrierId },
    });
    if (!convo) {
      convo = this.conversationRepo.create({
        shipmentId,
        shipperId,
        carrierId,
      });
      convo = await this.conversationRepo.save(convo);
    }
    return convo;
  }

  async listConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepo.find({
      where: [{ shipperId: userId }, { carrierId: userId }],
      relations: ['shipment', 'shipper', 'carrier'],
      order: { updatedAt: 'DESC' },
    });
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    body: string,
  ): Promise<Message> {
    const convo = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException('Conversation not found');
    if (convo.shipperId !== senderId && convo.carrierId !== senderId) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const msg = this.messageRepo.create({
      conversationId,
      senderId,
      body,
    });
    const saved = await this.messageRepo.save(msg);

    const recipientId =
      convo.shipperId === senderId ? convo.carrierId : convo.shipperId;
    this.eventEmitter.emit('message.created', {
      recipientId,
      message: saved,
    });

    return saved;
  }

  async getMessages(
    conversationId: string,
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<{ data: Message[]; total: number }> {
    const convo = await this.conversationRepo.findOne({
      where: { id: conversationId },
    });
    if (!convo) throw new NotFoundException('Conversation not found');
    if (convo.shipperId !== userId && convo.carrierId !== userId) {
      throw new ForbiddenException('Not a participant in this conversation');
    }

    const [data, total] = await this.messageRepo.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}
