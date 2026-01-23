import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationService } from '../services/notification.service';
import { Notification, NotificationPreference, NotificationType } from '../entities/index';
import {
  EmailProvider,
  SmsProvider,
  InAppProvider,
} from '../providers/index';
import { NotificationTemplateService } from '../templates/notification-template.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let notificationRepository: any;
  let preferenceRepository: any;
  let emailProvider: EmailProvider;
  let smsProvider: SmsProvider;
  let inAppProvider: InAppProvider;
  let templateService: NotificationTemplateService;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: mockRepository,
        },
        {
          provide: EmailProvider,
          useValue: {
            send: jest.fn().mockResolvedValue(true),
            isConfigured: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: SmsProvider,
          useValue: {
            send: jest.fn().mockResolvedValue(true),
            isConfigured: jest.fn().mockReturnValue(false),
          },
        },
        {
          provide: InAppProvider,
          useValue: {
            send: jest.fn().mockResolvedValue(true),
            isConfigured: jest.fn().mockReturnValue(true),
          },
        },
        NotificationTemplateService,
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    notificationRepository = module.get(getRepositoryToken(Notification));
    preferenceRepository = module.get(getRepositoryToken(NotificationPreference));
    emailProvider = module.get<EmailProvider>(EmailProvider);
    smsProvider = module.get<SmsProvider>(SmsProvider);
    inAppProvider = module.get<InAppProvider>(InAppProvider);
    templateService = module.get<NotificationTemplateService>(NotificationTemplateService);
  });

  describe('sendNotification', () => {
    it('should send notification through enabled channels', async () => {
      const userId = 'test-user-id';
      const sendData = {
        userId,
        type: NotificationType.SHIPMENT_CREATED,
        title: 'Test',
        message: 'Test message',
        recipientEmail: 'test@example.com',
        recipientPhone: '+1234567890',
        metadata: {},
      };

      const mockPreferences = {
        userId,
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        notificationTypes: [NotificationType.SHIPMENT_CREATED],
      };

      preferenceRepository.findOne.mockResolvedValue(mockPreferences);
      notificationRepository.create.mockReturnValue({});
      notificationRepository.save.mockResolvedValue({});

      const result = await service.sendNotification(sendData);

      expect(result).toBe(true);
      expect(notificationRepository.save).toHaveBeenCalled();
    });

    it('should not send if notification type is disabled', async () => {
      const userId = 'test-user-id';
      const sendData = {
        userId,
        type: NotificationType.SHIPMENT_CREATED,
        title: 'Test',
        message: 'Test message',
      };

      const mockPreferences = {
        userId,
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        notificationTypes: [],
      };

      preferenceRepository.findOne.mockResolvedValue(mockPreferences);

      const result = await service.sendNotification(sendData);

      expect(result).toBe(false);
    });
  });

  describe('getNotifications', () => {
    it('should return all notifications for a user', async () => {
      const userId = 'test-user-id';
      const mockNotifications = [
        {
          id: '1',
          userId,
          type: NotificationType.SHIPMENT_CREATED,
          title: 'Test',
          message: 'Test message',
          isRead: false,
        },
      ];

      notificationRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getNotifications(userId);

      expect(result).toEqual(mockNotifications);
      expect(notificationRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const userId = 'test-user-id';
      const notificationId = 'notification-id';
      const mockNotification = {
        id: notificationId,
        userId,
        isRead: false,
      };

      notificationRepository.findOne.mockResolvedValue(mockNotification);
      notificationRepository.save.mockResolvedValue({ ...mockNotification, isRead: true });

      const result = await service.markAsRead(notificationId, userId);

      expect(result.isRead).toBe(true);
      expect(notificationRepository.save).toHaveBeenCalled();
    });

    it('should throw error if notification not found', async () => {
      notificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markAsRead('invalid-id', 'user-id')).rejects.toThrow(
        'Notification not found',
      );
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const userId = 'test-user-id';
      const notificationId = 'notification-id';
      const mockNotification = {
        id: notificationId,
        userId,
      };

      notificationRepository.findOne.mockResolvedValue(mockNotification);
      notificationRepository.remove.mockResolvedValue(mockNotification);

      await service.deleteNotification(notificationId, userId);

      expect(notificationRepository.remove).toHaveBeenCalledWith(mockNotification);
    });
  });

  describe('getOrCreatePreferences', () => {
    it('should return existing preferences', async () => {
      const userId = 'test-user-id';
      const mockPreferences = {
        userId,
        emailEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
      };

      preferenceRepository.findOne.mockResolvedValue(mockPreferences);

      const result = await service.getOrCreatePreferences(userId);

      expect(result).toEqual(mockPreferences);
      expect(preferenceRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
    });

    it('should create new preferences if not exists', async () => {
      const userId = 'test-user-id';

      preferenceRepository.findOne.mockResolvedValue(null);
      preferenceRepository.create.mockReturnValue({
        userId,
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
        notificationTypes: expect.any(Array),
      });
      preferenceRepository.save.mockResolvedValue({
        userId,
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
      });

      const result = await service.getOrCreatePreferences(userId);

      expect(result.userId).toBe(userId);
      expect(preferenceRepository.create).toHaveBeenCalled();
      expect(preferenceRepository.save).toHaveBeenCalled();
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', async () => {
      const userId = 'test-user-id';
      const updateData = {
        emailEnabled: false,
        smsEnabled: true,
      };

      const mockPreferences = {
        userId,
        emailEnabled: true,
        smsEnabled: true,
        inAppEnabled: true,
      };

      preferenceRepository.findOne.mockResolvedValue(mockPreferences);
      preferenceRepository.save.mockResolvedValue({ ...mockPreferences, ...updateData });

      const result = await service.updatePreferences(userId, updateData);

      expect(result.emailEnabled).toBe(false);
      expect(preferenceRepository.save).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const userId = 'test-user-id';
      notificationRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(5);
      expect(notificationRepository.count).toHaveBeenCalledWith({
        where: { userId, isRead: false },
      });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'test-user-id';
      notificationRepository.update.mockResolvedValue({ affected: 3 });

      const result = await service.markAllAsRead(userId);

      expect(result).toBe(3);
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all notifications for a user', async () => {
      const userId = 'test-user-id';
      notificationRepository.delete.mockResolvedValue({ affected: 5 });

      const result = await service.deleteAllNotifications(userId);

      expect(result).toBe(5);
    });
  });
});
