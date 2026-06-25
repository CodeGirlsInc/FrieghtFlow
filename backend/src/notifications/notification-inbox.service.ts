import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationInboxService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(input: CreateNotificationInput): Promise<Notification> {
    return this.repo.save(this.repo.create(input));
  }

  async findAll(userId: string, page = 1, limit = 20, isRead?: boolean) {
    const where: { userId: string; isRead?: boolean } = { userId };
    if (isRead !== undefined) where.isRead = isRead;

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unread = await this.repo.count({ where: { userId, isRead: false } });
    return { items, total, unread, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markRead(id: string, userId: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, userId } });
    if (!item) throw new NotFoundException('Notification not found');
    item.isRead = true;
    await this.repo.save(item);
  }

  async markAllRead(userId: string): Promise<void> {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
  }

  async unreadCount(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, isRead: false } });
  }
}