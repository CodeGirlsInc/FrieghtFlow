import { Test, type TestingModule } from '@nestjs/testing';
import { InAppNotificationService } from '../services/in-app-notification.service';
import {
  type Notification,
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';

describe('InAppNotificationService', () => {
  let service: InAppNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InAppNotificationService],
    }).compile();

    service = module.get<InAppNotificationService>(InAppNotificationService);
  });

  afterEach(() => {
    service.clearAllQueues();
  });

  describe('sendInAppNotification', () => {
    it('should send in-app notification', async () => {
      const notification = {
        id: 'notif-1',
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.IN_APP,
        recipientId: 'user-1',
        title: 'Shipment Created',
        message: 'Your shipment has been created',
        data: { trackingNumber: 'TRK123456' },
        actionUrl: 'https://app.example.com/track',
        actionText: 'Track Shipment',
      } as Notification;

      await service.sendInAppNotification(notification);

      const userNotifications = await service.getUserNotifications('user-1');
      expect(userNotifications).toHaveLength(1);
      expect(userNotifications[0].id).toBe('notif-1');
      expect(userNotifications[0].title).toBe('Shipment Created');
      expect(userNotifications[0].read).toBe(false);
    });

    it('should limit notifications per user to 100', async () => {
      const notification = {
        id: 'notif-base',
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.IN_APP,
        recipientId: 'user-1',
        title: 'Test Notification',
        message: 'Test message',
      } as Notification;

      // Send 105 notifications
      for (let i = 0; i < 105; i++) {
        await service.sendInAppNotification({
          ...notification,
          id: `notif-${i}`,
        });
      }

      const userNotifications = await service.getUserNotifications(
        'user-1',
        200,
      );
      expect(userNotifications).toHaveLength(100);
      expect(userNotifications[0].id).toBe('notif-104'); // Most recent first
    });
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with limit', async () => {
      const notification = {
        id: 'notif-base',
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.IN_APP,
        recipientId: 'user-1',
        title: 'Test Notification',
        message: 'Test message',
      } as Notification;

      // Send 25 notifications
      for (let i = 0; i < 25; i++) {
        await service.sendInAppNotification({
          ...notification,
          id: `notif-${i}`,
        });
      }

      const notifications = await service.getUserNotifications('user-1', 10);
      expect(notifications).toHaveLength(10);
      expect(notifications[0].id).toBe('notif-24'); // Most recent first
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', async () => {
      const notification = {
        id: 'notif-base',
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.IN_APP,
        recipientId: 'user-1',
        title: 'Test Notification',
        message: 'Test message',
      } as Notification;

      // Send 5 notifications
      for (let i = 0; i < 5; i++) {
        await service.sendInAppNotification({
          ...notification,
          id: `notif-${i}`,
        });
      }

      let unreadCount = await service.getUnreadCount('user-1');
      expect(unreadCount).toBe(5);

      // Mark 2 as read
      await service.markAsRead('user-1', 'notif-0');
      await service.markAsRead('user-1', 'notif-1');

      unreadCount = await service.getUnreadCount('user-1');
      expect(unreadCount).toBe(3);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = {
        id: 'notif-1',
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.IN_APP,
        recipientId: 'user-1',
        title: 'Test Notification',
        message: 'Test message',
      } as Notification;

      await service.sendInAppNotification(notification);

      let userNotifications = await service.getUserNotifications('user-1');
      expect(userNotifications[0].read).toBe(false);

      await service.markAsRead('user-1', 'notif-1');

      userNotifications = await service.getUserNotifications('user-1');
      expect(userNotifications[0].read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const notification = {
        id: 'notif-base',
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.IN_APP,
        recipientId: 'user-1',
        title: 'Test Notification',
        message: 'Test message',
      } as Notification;

      // Send 3 notifications
      for (let i = 0; i < 3; i++) {
        await service.sendInAppNotification({
          ...notification,
          id: `notif-${i}`,
        });
      }

      let unreadCount = await service.getUnreadCount('user-1');
      expect(unreadCount).toBe(3);

      await service.markAllAsRead('user-1');

      unreadCount = await service.getUnreadCount('user-1');
      expect(unreadCount).toBe(0);
    });
  });

  describe('queue management', () => {
    it('should manage notification queues correctly', async () => {
      expect(service.getQueueSize()).toBe(0);

      const notification = {
        id: 'notif-1',
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.IN_APP,
        recipientId: 'user-1',
        title: 'Test Notification',
        message: 'Test message',
      } as Notification;

      await service.sendInAppNotification(notification);

      expect(service.getQueueSize()).toBe(1);

      const allQueues = await service.getAllQueuedNotifications();
      expect(allQueues.size).toBe(1);
      expect(allQueues.get('user-1')).toHaveLength(1);

      service.clearAllQueues();
      expect(service.getQueueSize()).toBe(0);
    });
  });
});
