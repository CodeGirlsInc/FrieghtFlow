import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { WebSocketConnection } from '../entities/websocket-connection.entity';

@Injectable()
export class WebSocketConnectionService {
  constructor(
    @InjectRepository(WebSocketConnection)
    private readonly connectionRepository: Repository<WebSocketConnection>,
  ) {}

  async createConnection(
    userId: string,
    socketId: string,
  ): Promise<WebSocketConnection> {
    const connection = this.connectionRepository.create({
      userId,
      socketId,
      lastHeartbeat: new Date(),
    });

    return this.connectionRepository.save(connection);
  }

  async updateHeartbeat(socketId: string): Promise<void> {
    await this.connectionRepository.update(
      { socketId },
      { lastHeartbeat: new Date() },
    );
  }

  async removeConnection(socketId: string): Promise<void> {
    await this.connectionRepository.delete({ socketId });
  }

  async removeUserConnections(userId: string): Promise<void> {
    await this.connectionRepository.delete({ userId });
  }

  async getOnlineUsers(freightJobIds: string[]): Promise<string[]> {
    // This would typically join with a freight_jobs table to get users
    // For now, we'll return all connected users
    const connections = await this.connectionRepository.find({
      select: ['userId'],
    });

    return [...new Set(connections.map((c) => c.userId))];
  }

  async cleanupStaleConnections(maxAgeMinutes: number = 30): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - maxAgeMinutes);

    const result = await this.connectionRepository.delete({
      lastHeartbeat: LessThan(cutoffTime),
    });

    return result.affected || 0;
  }

  async isUserOnline(userId: string): Promise<boolean> {
    const count = await this.connectionRepository.count({
      where: { userId },
    });
    return count > 0;
  }
}

