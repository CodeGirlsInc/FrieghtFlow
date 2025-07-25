import { Injectable } from '@nestjs/common';
import type { Notification } from '../entities/notification.entity';

export interface InAppNotificationMessage {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  actionText?: string;
  timestamp: Date;
  read: boolean;
}

@Injectable()
export class InAppNotificationService {
  private notificationQueue: Map<string, InAppNotificationMessage[]> =
    new Map();

  async sendInAppNotification(notification: Notification): Promise<void> {
    const message: InAppNotificationMessage = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      timestamp: new Date(),
      read: false,
    };

    const userNotifications =
      this.notificationQueue.get(notification.recipientId) || [];
    userNotifications.unshift(message); // Add to beginning of array

    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }

    this.notificationQueue.set(notification.recipientId, userNotifications);

    console.log(
      `🔔 In-app notification sent to user ${notification.recipientId}:`,
    );
    console.log(`   Title: ${notification.title}`);
    console.log(`   Message: ${notification.message}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);
  }

  async getUserNotifications(
    userId: string,
    limit = 20,
  ): Promise<InAppNotificationMessage[]> {
    const notifications = this.notificationQueue.get(userId) || [];
    return notifications.slice(0, limit);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const notifications = this.notificationQueue.get(userId) || [];
    return notifications.filter((n) => !n.read).length;
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notifications = this.notificationQueue.get(userId) || [];
    const notification = notifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.read = true;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const notifications = this.notificationQueue.get(userId) || [];
    notifications.forEach((n) => {
      n.read = true;
    });
  }

  async clearUserNotifications(userId: string): Promise<void> {
    this.notificationQueue.delete(userId);
  }

  async getAllQueuedNotifications(): Promise<
    Map<string, InAppNotificationMessage[]>
  > {
    return new Map(this.notificationQueue);
  }

  getQueueSize(): number {
    let total = 0;
    for (const notifications of this.notificationQueue.values()) {
      total += notifications.length;
    }
    return total;
  }

  clearAllQueues(): void {
    this.notificationQueue.clear();
  }
}
