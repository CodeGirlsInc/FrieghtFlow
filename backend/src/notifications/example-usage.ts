import { Injectable } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { NotificationService } from './services/notification.service';
import type { NotificationPreferenceService } from './services/notification-preference.service';
import type { EmailService } from './services/email.service';
import type { InAppNotificationService } from './services/in-app-notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from './entities/notification.entity';
import {
  ShipmentCreatedEvent,
  ShipmentDeliveredEvent,
  ShipmentDelayedEvent,
} from './events/shipment.events';

@Injectable()
export class NotificationExampleService {
  constructor(
    private eventEmitter: EventEmitter2,
    private notificationService: NotificationService,
    private preferenceService: NotificationPreferenceService,
    private emailService: EmailService,
    private inAppService: InAppNotificationService,
  ) {}

  // Example: Trigger shipment created notification
  async triggerShipmentCreated(): Promise<void> {
    const event = new ShipmentCreatedEvent(
      'shipment-123',
      'TRK123456789',
      'user-456',
      'customer@example.com',
      'John Customer',
      'New York Warehouse',
      '123 Main St, Los Angeles, CA',
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      [
        { name: 'Wireless Headphones', quantity: 1, value: 199.99 },
        { name: 'Phone Case', quantity: 2, value: 29.99 },
      ],
      { orderNumber: 'ORD-789', priority: 'standard' },
    );

    // Emit the event - listeners will handle notification sending
    this.eventEmitter.emit('shipment.created', event);
  }

  // Example: Trigger shipment delivered notification
  async triggerShipmentDelivered(): Promise<void> {
    const event = new ShipmentDeliveredEvent(
      'shipment-123',
      'TRK123456789',
      'user-456',
      'customer@example.com',
      'John Customer',
      new Date(),
      'Front door',
      'John Customer',
      'Package left at front door as requested',
      { deliveryPhoto: 'photo-url', signature: 'signature-data' },
    );

    this.eventEmitter.emit('shipment.delivered', event);
  }

  // Example: Send custom notification
  async sendCustomNotification(): Promise<void> {
    await this.notificationService.sendNotification({
      type: NotificationType.SYSTEM_ALERT,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      priority: NotificationPriority.HIGH,
      recipientIds: ['user-456'],
      customTitle: 'System Maintenance Scheduled',
      customMessage:
        'Our system will undergo maintenance on January 15th from 2:00 AM to 4:00 AM EST. During this time, tracking updates may be delayed.',
      actionUrl: 'https://app.example.com/maintenance-info',
      actionText: 'Learn More',
      senderId: 'system',
      senderName: 'System Administrator',
    });
  }

  // Example: Set user notification preferences
  async setupUserPreferences(userId: string): Promise<void> {
    // Set default preferences for a new user
    await this.preferenceService.setDefaultPreferences(userId);

    // Customize specific preferences
    await this.preferenceService.updatePreference(
      userId,
      NotificationType.SHIPMENT_CREATED,
      NotificationChannel.EMAIL,
      { enabled: true },
    );

    await this.preferenceService.updatePreference(
      userId,
      NotificationType.SHIPMENT_DELIVERED,
      NotificationChannel.SMS,
      { enabled: false }, // User doesn't want SMS for deliveries
    );
  }

  // Example: Bulk update preferences
  async bulkUpdatePreferences(userId: string): Promise<void> {
    await this.preferenceService.bulkUpdatePreferences({
      userId,
      preferences: {
        [NotificationType.SHIPMENT_CREATED]: {
          enabled: true,
          channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        },
        [NotificationType.SHIPMENT_DELIVERED]: {
          enabled: true,
          channels: [
            NotificationChannel.EMAIL,
            NotificationChannel.IN_APP,
            NotificationChannel.SMS,
          ],
        },
        [NotificationType.SHIPMENT_DELAYED]: {
          enabled: true,
          channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
        },
        [NotificationType.SHIPMENT_CANCELLED]: {
          enabled: true,
          channels: [NotificationChannel.EMAIL],
        },
      },
    });
  }

  // Example: Send direct email
  async sendDirectEmail(): Promise<void> {
    const result = await this.emailService.sendEmail({
      to: 'customer@example.com',
      subject: 'Welcome to Our Shipping Service',
      text: "Thank you for choosing our shipping service. We're committed to delivering your packages safely and on time.",
      html: `
        <h2>Welcome to Our Shipping Service</h2>
        <p>Thank you for choosing our shipping service.</p>
        <p>We're committed to delivering your packages safely and on time.</p>
        <p><a href="https://app.example.com/dashboard">Visit Your Dashboard</a></p>
      `,
    });

    console.log('Email sent:', result);
  }

  // Example: Send template email
  async sendTemplateEmail(): Promise<void> {
    const result = await this.emailService.sendTemplateEmail(
      'customer@example.com',
      'shipment_created',
      {
        trackingNumber: 'TRK987654321',
        recipientName: 'Jane Customer',
        origin: 'Chicago Distribution Center',
        destination: '456 Oak Ave, Denver, CO',
        estimatedDelivery: 'January 18, 2024',
        items: [
          { name: 'Laptop Stand', quantity: 1, value: 89.99 },
          { name: 'USB Cable', quantity: 3, value: 15.99 },
        ],
        actionUrl: 'https://app.example.com/track/TRK987654321',
      },
    );

    console.log('Template email sent:', result);
  }

  // Example: Get user's in-app notifications
  async getUserInAppNotifications(userId: string): Promise<void> {
    const notifications = await this.inAppService.getUserNotifications(
      userId,
      10,
    );
    const unreadCount = await this.inAppService.getUnreadCount(userId);

    console.log(`User ${userId} has ${unreadCount} unread notifications:`);
    notifications.forEach((notif) => {
      console.log(
        `- ${notif.title}: ${notif.message} (${notif.read ? 'read' : 'unread'})`,
      );
    });
  }

  // Example: Mark notifications as read
  async markNotificationsAsRead(userId: string): Promise<void> {
    // Mark specific notification as read
    const notifications = await this.inAppService.getUserNotifications(
      userId,
      5,
    );
    if (notifications.length > 0) {
      await this.inAppService.markAsRead(userId, notifications[0].id);
      console.log(`Marked notification ${notifications[0].id} as read`);
    }

    // Mark all notifications as read
    await this.inAppService.markAllAsRead(userId);
    console.log(`Marked all notifications as read for user ${userId}`);
  }

  // Example: Get notification statistics
  async getNotificationStats(): Promise<void> {
    const stats = await this.notificationService.getNotificationStats();
    console.log('Notification Statistics:', {
      total: stats.total,
      unread: stats.unread,
      byStatus: stats.byStatus,
      byType: stats.byType,
      byChannel: stats.byChannel,
    });

    // Get stats for specific user
    const userStats =
      await this.notificationService.getNotificationStats('user-456');
    console.log('User 456 Statistics:', userStats);
  }

  // Example: Simulate shipment lifecycle with notifications
  async simulateShipmentLifecycle(): Promise<void> {
    const shipmentId = 'shipment-demo-001';
    const trackingNumber = 'DEMO123456';
    const userId = 'demo-user';
    const userEmail = 'demo@example.com';
    const userName = 'Demo User';

    console.log('🚀 Starting shipment lifecycle simulation...');

    // 1. Shipment created
    console.log('📦 Creating shipment...');
    const createdEvent = new ShipmentCreatedEvent(
      shipmentId,
      trackingNumber,
      userId,
      userEmail,
      userName,
      'Demo Warehouse',
      'Demo Destination',
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      [{ name: 'Demo Product', quantity: 1, value: 99.99 }],
    );
    this.eventEmitter.emit('shipment.created', createdEvent);

    // Wait a bit to simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 2. Shipment delayed (optional)
    console.log('⏰ Simulating delay...');
    const delayedEvent = new ShipmentDelayedEvent(
      shipmentId,
      trackingNumber,
      userId,
      userEmail,
      userName,
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      'Weather conditions',
    );
    this.eventEmitter.emit('shipment.delayed', delayedEvent);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 3. Shipment delivered
    console.log('✅ Delivering shipment...');
    const deliveredEvent = new ShipmentDeliveredEvent(
      shipmentId,
      trackingNumber,
      userId,
      userEmail,
      userName,
      new Date(),
      'Front door',
      userName,
      'Package delivered successfully',
    );
    this.eventEmitter.emit('shipment.delivered', deliveredEvent);

    console.log('🎉 Shipment lifecycle simulation completed!');
  }

  // Example: Debug email and in-app queues
  async debugQueues(): Promise<void> {
    console.log('📧 Email Queue:');
    const emailQueue = this.emailService.getEmailQueue();
    emailQueue.forEach((email, index) => {
      console.log(
        `  ${index + 1}. To: ${email.email.to}, Subject: ${email.email.subject}`,
      );
    });

    console.log('\n🔔 In-App Notification Queue:');
    const inAppQueue = await this.inAppService.getAllQueuedNotifications();
    for (const [userId, notifications] of inAppQueue.entries()) {
      console.log(`  User ${userId}: ${notifications.length} notifications`);
      notifications.slice(0, 3).forEach((notif, index) => {
        console.log(
          `    ${index + 1}. ${notif.title} (${notif.read ? 'read' : 'unread'})`,
        );
      });
    }

    console.log(
      `\nTotal email queue size: ${this.emailService.getQueueSize()}`,
    );
    console.log(`Total in-app queue size: ${this.inAppService.getQueueSize()}`);
  }
}
