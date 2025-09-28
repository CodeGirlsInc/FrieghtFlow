import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentAccessLog, AccessAction } from '../entities/document-access-log.entity';
import { Request } from 'express';

@Injectable()
export class DocumentAccessLogService {
  private readonly logger = new Logger(DocumentAccessLogService.name);

  constructor(
    @InjectRepository(DocumentAccessLog)
    private accessLogRepository: Repository<DocumentAccessLog>,
  ) {}

  async logAccess(
    documentId: string,
    action: AccessAction,
    request: Request,
    userId?: string,
    notes?: string,
    metadata?: Record<string, any>,
  ): Promise<DocumentAccessLog> {
    this.logger.log(`Logging access: ${action} for document: ${documentId}`);

    const accessLog = this.accessLogRepository.create({
      documentId,
      userId,
      action,
      ipAddress: this.getClientIp(request),
      userAgent: request.get('User-Agent'),
      sessionId: request.get('X-Session-ID'),
      notes,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        url: request.url,
        method: request.method,
      },
    });

    return this.accessLogRepository.save(accessLog);
  }

  async getDocumentAccessLogs(documentId: string, limit: number = 50): Promise<DocumentAccessLog[]> {
    return this.accessLogRepository.find({
      where: { documentId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUserAccessLogs(userId: string, limit: number = 50): Promise<DocumentAccessLog[]> {
    return this.accessLogRepository.find({
      where: { userId },
      relations: ['document'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getAccessStats(documentId?: string, userId?: string, days: number = 30): Promise<any> {
    const queryBuilder = this.accessLogRepository.createQueryBuilder('log');

    if (documentId) {
      queryBuilder.andWhere('log.documentId = :documentId', { documentId });
    }

    if (userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId });
    }

    queryBuilder.andWhere('log.createdAt >= :startDate', {
      startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
    });

    const stats = await queryBuilder
      .select([
        'log.action as action',
        'COUNT(*) as count',
        'DATE(log.createdAt) as date',
      ])
      .groupBy('log.action, DATE(log.createdAt)')
      .orderBy('date', 'DESC')
      .getRawMany();

    return stats;
  }

  async getRecentAccess(documentId: string, hours: number = 24): Promise<DocumentAccessLog[]> {
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.accessLogRepository.find({
      where: {
        documentId,
        createdAt: {
          $gte: startDate,
        } as any,
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSuspiciousActivity(threshold: number = 10): Promise<DocumentAccessLog[]> {
    // Find users with high access frequency
    const suspiciousUsers = await this.accessLogRepository
      .createQueryBuilder('log')
      .select(['log.userId', 'COUNT(*) as accessCount'])
      .where('log.createdAt >= :startDate', {
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      })
      .groupBy('log.userId')
      .having('COUNT(*) > :threshold', { threshold })
      .getRawMany();

    if (suspiciousUsers.length === 0) {
      return [];
    }

    const userIds = suspiciousUsers.map(user => user.userId);

    return this.accessLogRepository.find({
      where: {
        userId: {
          $in: userIds,
        } as any,
      },
      relations: ['user', 'document'],
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const result = await this.accessLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old access logs`);
    return result.affected || 0;
  }

  private getClientIp(request: Request): string {
    return (
      request.get('X-Forwarded-For') ||
      request.get('X-Real-IP') ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
