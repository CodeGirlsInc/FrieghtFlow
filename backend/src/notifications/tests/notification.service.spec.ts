import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
  NotificationPriority,
} from '../entities/notification.entity';
import type { CreateNotificationDto } from '../dto/create-notification.dto';
import { jest } from '@jest/globals';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: Repository<Notification>;
  let eventEmitter: EventEmitter2;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getCount: jest.fn(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    where: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    delete: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<Repository<Notification>>(
      getRepositoryToken(Notification),
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const createDto: CreateNotificationDto = {
        type: NotificationType.SHIPMENT_CREATED,
        channel: NotificationChannel.EMAIL,
        priority: NotificationPriority.NORMAL,
        recipientId: 'user-1',
        recipientEmail: 'user@example.com',
        recipientName: 'John Doe',
        title: 'Shipment Created',
        message: 'Your shipment has been created',
      };

      const mockNotification = {
        id: 'notification-1',
        ...createDto,
        status: NotificationStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        scheduledAt: expect.any(Date),
        expiresAt: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'notification.created',
        mockNotification,
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findAll', () => {
    it('should return paginated notifications', async () => {
      const mockNotifications = [
        { id: '1', title: 'Test 1', type: NotificationType.SHIPMENT_CREATED },
        { id: '2', title: 'Test 2', type: NotificationType.SHIPMENT_DELIVERED },
      ];

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        mockNotifications,
        2,
      ]);

      const result = await service.findAll(1, 10);

      expect(result).toEqual({
        data: mockNotifications,
        total: 2,
        page: 1,
        limit: 10,
      });
    });

    it('should apply filters correctly', async () => {
      const filters = {
        recipientId: 'user-1',
        type: NotificationType.SHIPMENT_CREATED.toString(),
        channel: NotificationChannel.EMAIL,
        status: NotificationStatus.SENT,
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(1, 10, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.recipientId = :recipientId',
        {
          recipientId: 'user-1',
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.type = :type',
        {
          type: NotificationType.SHIPMENT_CREATED.toString(),
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.channel = :channel',
        {
          channel: NotificationChannel.EMAIL,
        },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'notification.status = :status',
        {
          status: NotificationStatus.SENT,
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return a notification by id', async () => {
      const mockNotification = {
        id: 'notification-1',
        title: 'Test Notification',
        message: 'Test message',
      };

      mockRepository.findOne.mockResolvedValue(mockNotification);

      const result = await service.findOne('notification-1');

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notification-1' },
      });
      expect(result).toEqual(mockNotification);
    });

    it('should throw NotFoundException when notification not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('notification-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notification-1',
        status: NotificationStatus.SENT,
        readAt: null,
      };

      mockRepository.findOne.mockResolvedValue(mockNotification);
      mockRepository.save.mockResolvedValue({
        ...mockNotification,
        status: NotificationStatus.READ,
        readAt: expect.any(Date),
      });

      const result = await service.markAsRead('notification-1');

      expect(result.status).toBe(NotificationStatus.READ);
      expect(result.readAt).toBeDefined();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for recipient', async () => {
      mockRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount('user-1');

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {
          recipientId: 'user-1',
          status: NotificationStatus.SENT,
        },
      });
      expect(result).toBe(5);
    });
  });

  describe('getNotificationStats', () => {
    it('should return notification statistics', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getCount.mockResolvedValue(100);

      const mockClone = {
        ...mockQueryBuilder,
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(25),
      };
      mockQueryBuilder.clone.mockReturnValue(mockClone);

      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([
          { status: NotificationStatus.SENT, count: '50' },
          { status: NotificationStatus.READ, count: '30' },
        ])
        .mockResolvedValueOnce([
          { type: NotificationType.SHIPMENT_CREATED, count: '40' },
          { type: NotificationType.SHIPMENT_DELIVERED, count: '35' },
        ])
        .mockResolvedValueOnce([
          { channel: NotificationChannel.EMAIL, count: '60' },
          { channel: NotificationChannel.IN_APP, count: '40' },
        ]);

      const result = await service.getNotificationStats('user-1');

      expect(result.total).toBe(100);
      expect(result.unread).toBe(25);
      expect(result.byStatus[NotificationStatus.SENT]).toBe(50);
      expect(result.byType[NotificationType.SHIPMENT_CREATED]).toBe(40);
      expect(result.byChannel[NotificationChannel.EMAIL]).toBe(60);
    });
  });

  describe('bulkMarkAsRead', () => {
    it('should bulk mark notifications as read', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.execute.mockResolvedValue({ affected: 5 });

      await service.bulkMarkAsRead('user-1', ['notif-1', 'notif-2']);

      expect(mockQueryBuilder.update).toHaveBeenCalledWith(Notification);
      expect(mockQueryBuilder.set).toHaveBeenCalledWith({
        status: NotificationStatus.READ,
        readAt: expect.any(Date),
      });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'recipientId = :recipientId',
        { recipientId: 'user-1' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'id IN (:...ids)',
        { ids: ['notif-1', 'notif-2'] },
      );
    });
  });

  describe('deleteOldNotifications', () => {
    it('should delete old notifications', async () => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.execute.mockResolvedValue({ affected: 10 });

      const result = await service.deleteOldNotifications(30);

      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'createdAt < :cutoffDate',
        {
          cutoffDate: expect.any(Date),
        },
      );
      expect(result).toBe(10);
    });
  });
});
