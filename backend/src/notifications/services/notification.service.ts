import { Injectable, NotFoundException } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { Repository } from 'typeorm';
import {
  type Notification,
  NotificationStatus,
  type NotificationChannel,
} from '../entities/notification.entity';
import type { CreateNotificationDto } from '../dto/create-notification.dto';
import type { SendNotificationDto } from '../dto/send-notification.dto';

export interface NotificationFilters {
  recipientId?: string;
  type?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  startDate?: Date;
  endDate?: Date;
  priority?: string;
}

@Injectable()
export class NotificationService {
  constructor(
    private notificationRepository: Repository<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      scheduledAt: createNotificationDto.scheduledAt
        ? new Date(createNotificationDto.scheduledAt)
        : new Date(),
      expiresAt: createNotificationDto.expiresAt
        ? new Date(createNotificationDto.expiresAt)
        : null,
    });

    const savedNotification =
      await this.notificationRepository.save(notification);

    // Emit event for processing
    this.eventEmitter.emit('notification.created', savedNotification);

    return savedNotification;
  }

  async sendNotification(
    sendNotificationDto: SendNotificationDto,
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const recipientId of sendNotificationDto.recipientIds) {
      for (const channel of sendNotificationDto.channels) {
        // Get recipient details (in real app, fetch from user service)
        const recipientEmail = `user-${recipientId}@example.com`;
        const recipientName = `User ${recipientId}`;

        let title = sendNotificationDto.customTitle || '';
        let message = sendNotificationDto.customMessage || '';

        // If using template, process it
        if (sendNotificationDto.templateName) {
          const processed = await this.processTemplate(
            sendNotificationDto.templateName,
            channel,
            sendNotificationDto.templateData || {},
          );
          title = processed.subject;
          message = processed.message;
        }

        const notification = await this.create({
          type: sendNotificationDto.type,
          channel,
          priority: sendNotificationDto.priority,
          recipientId,
          recipientEmail,
          recipientName,
          title,
          message,
          relatedEntityId: sendNotificationDto.relatedEntityId,
          relatedEntityType: sendNotificationDto.relatedEntityType,
          actionUrl: sendNotificationDto.actionUrl,
          actionText: sendNotificationDto.actionText,
          senderId: sendNotificationDto.senderId,
          senderName: sendNotificationDto.senderName,
          data: sendNotificationDto.templateData,
        });

        notifications.push(notification);
      }
    }

    return notifications;
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: NotificationFilters,
  ): Promise<{
    data: Notification[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.notificationRepository.createQueryBuilder('notification');

    if (filters?.recipientId) {
      queryBuilder.andWhere('notification.recipientId = :recipientId', {
        recipientId: filters.recipientId,
      });
    }

    if (filters?.type) {
      queryBuilder.andWhere('notification.type = :type', {
        type: filters.type,
      });
    }

    if (filters?.channel) {
      queryBuilder.andWhere('notification.channel = :channel', {
        channel: filters.channel,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('notification.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('notification.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('notification.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAsDelivered(id: string): Promise<Notification> {
    const notification = await this.findOne(id);

    notification.status = NotificationStatus.DELIVERED;
    notification.deliveredAt = new Date();

    return this.notificationRepository.save(notification);
  }

  async markAsFailed(id: string, errorMessage: string): Promise<Notification> {
    const notification = await this.findOne(id);

    notification.status = NotificationStatus.FAILED;
    notification.errorMessage = errorMessage;
    notification.retryCount += 1;

    return this.notificationRepository.save(notification);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        recipientId,
        status: NotificationStatus.SENT,
      },
    });
  }

  async getNotificationStats(recipientId?: string): Promise<{
    total: number;
    unread: number;
    byStatus: Record<NotificationStatus, number>;
    byType: Record<string, number>;
    byChannel: Record<NotificationChannel, number>;
  }> {
    const queryBuilder =
      this.notificationRepository.createQueryBuilder('notification');

    if (recipientId) {
      queryBuilder.where('notification.recipientId = :recipientId', {
        recipientId,
      });
    }

    const total = await queryBuilder.getCount();

    const unreadQuery = queryBuilder.clone();
    const unread = await unreadQuery
      .andWhere('notification.status = :status', {
        status: NotificationStatus.SENT,
      })
      .getCount();

    const statusStats = await queryBuilder
      .clone()
      .select('notification.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.status')
      .getRawMany();

    const typeStats = await queryBuilder
      .clone()
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.type')
      .getRawMany();

    const channelStats = await queryBuilder
      .clone()
      .select('notification.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.channel')
      .getRawMany();

    return {
      total,
      unread,
      byStatus: statusStats.reduce(
        (acc, item) => {
          acc[item.status] = Number.parseInt(item.count);
          return acc;
        },
        {} as Record<NotificationStatus, number>,
      ),
      byType: typeStats.reduce(
        (acc, item) => {
          acc[item.type] = Number.parseInt(item.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      byChannel: channelStats.reduce(
        (acc, item) => {
          acc[item.channel] = Number.parseInt(item.count);
          return acc;
        },
        {} as Record<NotificationChannel, number>,
      ),
    };
  }

  async bulkMarkAsRead(
    recipientId: string,
    notificationIds?: string[],
  ): Promise<void> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({
        status: NotificationStatus.READ,
        readAt: new Date(),
      })
      .where('recipientId = :recipientId', { recipientId });

    if (notificationIds && notificationIds.length > 0) {
      queryBuilder.andWhere('id IN (:...ids)', { ids: notificationIds });
    }

    await queryBuilder.execute();
  }

  async deleteOldNotifications(olderThanDays: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .andWhere('status IN (:...statuses)', {
        statuses: [
          NotificationStatus.READ,
          NotificationStatus.DELIVERED,
          NotificationStatus.FAILED,
        ],
      })
      .execute();

    return result.affected || 0;
  }

  private async processTemplate(
    templateName: string,
    channel: NotificationChannel,
    data: Record<string, any>,
  ): Promise<{ subject: string; message: string }> {
    // In a real implementation, this would fetch from NotificationTemplateService
    // For now, return mock processed template
    return {
      subject: `Processed template: ${templateName}`,
      message: `Template message with data: ${JSON.stringify(data)}`,
    };
  }
}
