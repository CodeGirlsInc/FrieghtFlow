import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebSocketConnectionService } from './websocket-connection.service';
import { WebSocketConnection } from '../entities/websocket-connection.entity';

describe('WebSocketConnectionService', () => {
  let service: WebSocketConnectionService;
  let repository: Repository<WebSocketConnection>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketConnectionService,
        {
          provide: getRepositoryToken(WebSocketConnection),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WebSocketConnectionService>(
      WebSocketConnectionService,
    );
    repository = module.get<Repository<WebSocketConnection>>(
      getRepositoryToken(WebSocketConnection),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createConnection', () => {
    it('should create and save a connection', async () => {
      const userId = 'user-123';
      const socketId = 'socket-123';
      const mockConnection = {
        id: 'conn-123',
        userId,
        socketId,
        connectedAt: new Date(),
        lastHeartbeat: new Date(),
      };

      mockRepository.create.mockReturnValue(mockConnection);
      mockRepository.save.mockResolvedValue(mockConnection);

      const result = await service.createConnection(userId, socketId);

      expect(mockRepository.create).toHaveBeenCalledWith({
        userId,
        socketId,
        lastHeartbeat: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockConnection);
      expect(result).toEqual(mockConnection);
    });
  });

  describe('updateHeartbeat', () => {
    it('should update connection heartbeat', async () => {
      const socketId = 'socket-123';

      mockRepository.update.mockResolvedValue({ affected: 1 });

      await service.updateHeartbeat(socketId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { socketId },
        { lastHeartbeat: expect.any(Date) },
      );
    });
  });

  describe('removeConnection', () => {
    it('should remove a connection by socket ID', async () => {
      const socketId = 'socket-123';

      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.removeConnection(socketId);

      expect(mockRepository.delete).toHaveBeenCalledWith({ socketId });
    });
  });

  describe('removeUserConnections', () => {
    it('should remove all connections for a user', async () => {
      const userId = 'user-123';

      mockRepository.delete.mockResolvedValue({ affected: 3 });

      await service.removeUserConnections(userId);

      expect(mockRepository.delete).toHaveBeenCalledWith({ userId });
    });
  });

  describe('isUserOnline', () => {
    it('should return true if user is online', async () => {
      const userId = 'user-123';

      mockRepository.count.mockResolvedValue(1);

      const result = await service.isUserOnline(userId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(result).toBe(true);
    });

    it('should return false if user is offline', async () => {
      const userId = 'user-123';

      mockRepository.count.mockResolvedValue(0);

      const result = await service.isUserOnline(userId);

      expect(result).toBe(false);
    });
  });
});

