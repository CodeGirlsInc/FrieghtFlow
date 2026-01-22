import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageService } from './message.service';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { MessageHistoryQueryDto } from '../dto/message-history-query.dto';

describe('MessageService', () => {
  let service: MessageService;
  let repository: Repository<Message>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    repository = module.get<Repository<Message>>(getRepositoryToken(Message));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create and save a message', async () => {
      const createMessageDto: CreateMessageDto = {
        freightJobId: 'job-123',
        messageContent: 'Test message',
      };
      const senderId = 'user-123';
      const mockMessage = {
        id: 'msg-123',
        freightJobId: 'job-123',
        senderId: 'user-123',
        messageContent: 'Test message',
        isRead: false,
        sentAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockMessage);
      mockRepository.save.mockResolvedValue(mockMessage);

      const result = await service.createMessage(createMessageDto, senderId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        freightJobId: createMessageDto.freightJobId,
        senderId,
        messageContent: 'Test message',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockMessage);
      expect(result).toEqual({
        id: mockMessage.id,
        freightJobId: mockMessage.freightJobId,
        senderId: mockMessage.senderId,
        messageContent: mockMessage.messageContent,
        isRead: mockMessage.isRead,
        sentAt: mockMessage.sentAt,
      });
    });

    it('should sanitize message content', async () => {
      const createMessageDto: CreateMessageDto = {
        freightJobId: 'job-123',
        messageContent: '<script>alert("xss")</script>Hello',
      };
      const senderId = 'user-123';
      const mockMessage = {
        id: 'msg-123',
        freightJobId: 'job-123',
        senderId: 'user-123',
        messageContent: 'Hello',
        isRead: false,
        sentAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockMessage);
      mockRepository.save.mockResolvedValue(mockMessage);

      await service.createMessage(createMessageDto, senderId);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messageContent: 'Hello',
        }),
      );
    });
  });

  describe('getMessageHistory', () => {
    it('should return paginated message history', async () => {
      const freightJobId = 'job-123';
      const query: MessageHistoryQueryDto = { page: 1, limit: 20 };
      const mockMessages = [
        {
          id: 'msg-1',
          freightJobId: 'job-123',
          senderId: 'user-1',
          messageContent: 'Message 1',
          isRead: false,
          sentAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        },
        {
          id: 'msg-2',
          freightJobId: 'job-123',
          senderId: 'user-2',
          messageContent: 'Message 2',
          isRead: false,
          sentAt: new Date('2024-01-02'),
          updatedAt: new Date(),
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockMessages, 2]);

      const result = await service.getMessageHistory(freightJobId, query);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { freightJobId },
        order: { sentAt: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result.messages).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(1);
    });

    it('should use default pagination values', async () => {
      const freightJobId = 'job-123';
      const query: MessageHistoryQueryDto = {};

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.getMessageHistory(freightJobId, query);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { freightJobId },
        order: { sentAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('markMessagesAsRead', () => {
    it('should mark messages as read', async () => {
      const freightJobId = 'job-123';
      const userId = 'user-123';

      mockRepository.update.mockResolvedValue({ affected: 5 });

      await service.markMessagesAsRead(freightJobId, userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        {
          freightJobId,
          senderId: expect.anything(),
          isRead: false,
        },
        { isRead: true },
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      const freightJobId = 'job-123';
      const userId = 'user-123';

      mockRepository.count.mockResolvedValue(5);

      const result = await service.getUnreadCount(freightJobId, userId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {
          freightJobId,
          senderId: expect.anything(),
          isRead: false,
        },
      });
      expect(result).toBe(5);
    });
  });
});

