import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, NotificationPreference } from '../entities';
import { SendNotificationDto } from '../dto';
import { EmailProvider, SmsProvider, InAppProvider, INotificationProvider } from '../providers';
import { NotificationTemplateService } from '../templates/notification-template.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,
    private emailProvider: EmailProvider,
    private smsProvider: SmsProvider,
    private inAppProvider: InAppProvider,
    private templateService: NotificationTemplateService,
  ) {}

  async sendNotification(data: SendNotificationDto): Promise<boolean> {
    try {
      // Get user preferences
      const preferences = await this.getOrCreatePreferences(data.userId);

      // Validate notification type is in user preferences
      if (!preferences.notificationTypes.includes(data.type)) {
        this.logger.log(`Notification type ${data.type} disabled for user ${data.userId}`);
        return false;
      }

      // Render template
      const template = this.templateService.renderTemplate(
        data.type as NotificationType,
        data.metadata || {},
      );

      // Send through enabled channels
      const results = await Promise.all([
        preferences.inAppEnabled ? this.sendInApp(data, template) : Promise.resolve(false),
        preferences.emailEnabled && data.recipientEmail
          ? this.sendEmail(data, template, data.recipientEmail)
          : Promise.resolve(false),
        preferences.smsEnabled && data.recipientPhone
          ? this.sendSms(data, template, data.recipientPhone)
          : Promise.resolve(false),
      ]);

      const success = results.some((result) => result);
      this.logger.log(`Notification sent to user ${data.userId}: ${success}`);
      return success;
    } catch (error) {
      this.logger.error(
        `Error sending notification to user ${data.userId}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  private async sendInApp(
    data: SendNotificationDto,
    template: { subject: string; body: string },
  ): Promise<boolean> {
    try {
      const notification = this.notificationRepository.create({
        userId: data.userId,
        type: data.type as NotificationType,
        title: template.subject,
        message: template.body,
        metadata: data.metadata,
        isRead: false,
      });

      await this.notificationRepository.save(notification);
      await this.inAppProvider.send(
        data.userId,
        template.subject,
        template.body,
        data.metadata,
      );

      this.logger.log(`In-app notification created for user ${data.userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${error.message}`);
      return false;
    }
  }

  private async sendEmail(
    data: SendNotificationDto,
    template: { subject: string; body: string },
    email: string,
  ): Promise<boolean> {
    try {
      const result = await this.emailProvider.send(
        email,
        template.subject,
        template.body,
        data.metadata,
      );

      if (result) {
        this.logger.log(`Email notification sent to ${email}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${error.message}`);
      return false;
    }
  }

  private async sendSms(
    data: SendNotificationDto,
    template: { subject: string; body: string },
    phone: string,
  ): Promise<boolean> {
    try {
      const result = await this.smsProvider.send(
        phone,
        template.subject,
        template.body,
        data.metadata,
      );

      if (result) {
        this.logger.log(`SMS notification sent to ${phone}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Failed to send SMS notification: ${error.message}`);
      return false;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

async getNotificationById(id: string, userId: string): Promise<Notification | null> {
  return this.notificationRepository.findOne({
    where: { id, userId },
  });
}
  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.getNotificationById(id, userId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    const notification = await this.getNotificationById(id, userId);

    if (!notification) {
      throw new Error('Notification not found');
    }

    await this.notificationRepository.remove(notification);
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );

    return result.affected || 0;
  }

  async deleteAllNotifications(userId: string): Promise<number> {
    const result = await this.notificationRepository.delete({ userId });
    return result.affected || 0;
  }

  async getOrCreatePreferences(userId: string): Promise<NotificationPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({
        userId,
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        notificationTypes: [
          NotificationType.SHIPMENT_CREATED,
          NotificationType.SHIPMENT_ASSIGNED,
          NotificationType.STATUS_UPDATED,
          NotificationType.DELIVERY_CONFIRMED,
          NotificationType.PAYMENT_RECEIVED,
          NotificationType.ISSUE_REPORTED,
        ],
      });

      preferences = await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    updateData: Record<string, any>,
  ): Promise<NotificationPreference> {
    let preferences = await this.getOrCreatePreferences(userId);

    if (updateData.emailEnabled !== undefined) {
      preferences.emailEnabled = updateData.emailEnabled;
    }

    if (updateData.smsEnabled !== undefined) {
      preferences.smsEnabled = updateData.smsEnabled;
    }

    if (updateData.inAppEnabled !== undefined) {
      preferences.inAppEnabled = updateData.inAppEnabled;
    }

    if (updateData.notificationTypes) {
      preferences.notificationTypes = updateData.notificationTypes;
    }

    return this.preferenceRepository.save(preferences);
  }

  async getPreferences(userId: string): Promise<NotificationPreference> {
    return this.getOrCreatePreferences(userId);
  }

  async deletePreferences(userId: string): Promise<void> {
    await this.preferenceRepository.delete({ userId });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}
