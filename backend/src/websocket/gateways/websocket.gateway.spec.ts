import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketGateway } from './websocket.gateway';
import { MessageService } from '../services/message.service';
import { WebSocketConnectionService } from '../services/websocket-connection.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { WebSocketConnection } from '../entities/websocket-connection.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('WebSocketGateway', () => {
  let gateway: WebSocketGateway;
  let messageService: MessageService;
  let connectionService: WebSocketConnectionService;

  const mockMessageService = {
    createMessage: jest.fn(),
    getMessageHistory: jest.fn(),
  };

  const mockConnectionService = {
    createConnection: jest.fn(),
    removeConnection: jest.fn(),
    updateHeartbeat: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketGateway,
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
        {
          provide: WebSocketConnectionService,
          useValue: mockConnectionService,
        },
        {
          provide: getRepositoryToken(Message),
          useValue: {},
        },
        {
          provide: getRepositoryToken(WebSocketConnection),
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('secret'),
          },
        },
      ],
    }).compile();

    gateway = module.get<WebSocketGateway>(WebSocketGateway);
    messageService = module.get<MessageService>(MessageService);
    connectionService = module.get<WebSocketConnectionService>(
      WebSocketConnectionService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should create connection on client connect', async () => {
      const mockClient = {
        id: 'socket-123',
        data: {
          user: {
            sub: 'user-123',
          },
        },
        disconnect: jest.fn(),
      } as any;

      mockConnectionService.createConnection.mockResolvedValue({});

      await gateway.handleConnection(mockClient);

      expect(mockConnectionService.createConnection).toHaveBeenCalledWith(
        'user-123',
        'socket-123',
      );
      expect(mockClient.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client if no user data', async () => {
      const mockClient = {
        id: 'socket-123',
        data: {},
        disconnect: jest.fn(),
      } as any;

      await gateway.handleConnection(mockClient);

      expect(mockClient.disconnect).toHaveBeenCalled();
      expect(mockConnectionService.createConnection).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should remove connection on client disconnect', async () => {
      const mockClient = {
        id: 'socket-123',
        data: {
          user: {
            sub: 'user-123',
          },
        },
        leave: jest.fn(),
      } as any;

      // Mock userRooms
      (gateway as any).userRooms = new Map([
        ['user-123', new Set(['job-123'])],
      ]);

      await gateway.handleDisconnect(mockClient);

      expect(mockConnectionService.removeConnection).toHaveBeenCalledWith(
        'socket-123',
      );
    });
  });

  describe('handleSendMessage', () => {
    it('should send message and broadcast to room', async () => {
      const mockClient = {
        id: 'socket-123',
        data: {
          user: {
            sub: 'user-123',
          },
        },
        emit: jest.fn(),
        to: jest.fn().mockReturnThis(),
      } as any;

      const sendMessageDto = {
        freightJobId: 'job-123',
        messageContent: 'Test message',
      };

      const mockMessage = {
        id: 'msg-123',
        freightJobId: 'job-123',
        senderId: 'user-123',
        messageContent: 'Test message',
        sentAt: new Date(),
      };

      mockMessageService.createMessage.mockResolvedValue(mockMessage);
      (gateway as any).server = {
        to: jest.fn().mockReturnValue({
          emit: jest.fn(),
        }),
      };
      (gateway as any).checkRateLimit = jest.fn().mockReturnValue(true);

      await gateway.handleSendMessage(mockClient, sendMessageDto, {
        sub: 'user-123',
      });

      expect(mockMessageService.createMessage).toHaveBeenCalledWith(
        sendMessageDto,
        'user-123',
      );
    });

    it('should reject message if rate limit exceeded', async () => {
      const mockClient = {
        id: 'socket-123',
        data: {
          user: {
            sub: 'user-123',
          },
        },
        emit: jest.fn(),
      } as any;

      const sendMessageDto = {
        freightJobId: 'job-123',
        messageContent: 'Test message',
      };

      (gateway as any).checkRateLimit = jest.fn().mockReturnValue(false);

      await gateway.handleSendMessage(mockClient, sendMessageDto, {
        sub: 'user-123',
      });

      expect(mockClient.emit).toHaveBeenCalledWith('error', {
        message: 'Rate limit exceeded. Please wait before sending another message.',
      });
      expect(mockMessageService.createMessage).not.toHaveBeenCalled();
    });
  });
});

