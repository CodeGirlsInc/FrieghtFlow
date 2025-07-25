import { Injectable, Logger } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { type AuditLog, AuditAction } from './entities/audit-log.entity';
import type { CreateAuditLogDto } from './dto/create-audit-log.dto';
import type { QueryAuditLogDto } from './dto/query-audit-log.dto';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private auditLogRepository: Repository<AuditLog>) {}

  async createLog(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = this.auditLogRepository.create(createAuditLogDto);
      const savedLog = await this.auditLogRepository.save(auditLog);

      this.logger.log(
        `Audit log created: ${savedLog.action} for user ${savedLog.userId || 'system'}`,
      );
      return savedLog;
    } catch (error) {
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(
    queryDto: QueryAuditLogDto,
  ): Promise<{ logs: AuditLog[]; total: number }> {
    const {
      limit,
      offset,
      action,
      userId,
      entityType,
      entityId,
      startDate,
      endDate,
      search,
    } = queryDto;

    const queryBuilder =
      this.auditLogRepository.createQueryBuilder('audit_log');

    // Apply filters
    if (action) {
      queryBuilder.andWhere('audit_log.action = :action', { action });
    }

    if (userId) {
      queryBuilder.andWhere('audit_log.userId = :userId', { userId });
    }

    if (entityType) {
      queryBuilder.andWhere('audit_log.entityType = :entityType', {
        entityType,
      });
    }

    if (entityId) {
      queryBuilder.andWhere('audit_log.entityId = :entityId', { entityId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'audit_log.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    if (search) {
      queryBuilder.andWhere(
        '(audit_log.userEmail ILIKE :search OR audit_log.entityType ILIKE :search OR audit_log.source ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Order by most recent first
    queryBuilder.orderBy('audit_log.createdAt', 'DESC');

    // Apply pagination
    queryBuilder.skip(offset).take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  async findByUser(userId: string, limit = 20): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }

  async getRecentLogs(limit = 50): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Helper methods for common audit actions
  async logUserCreation(
    userId: string,
    userEmail: string,
    userData: any,
    metadata?: any,
  ): Promise<AuditLog> {
    return this.createLog({
      action: AuditAction.USER_CREATED,
      userId,
      userEmail,
      entityType: 'User',
      entityId: userId,
      newValues: userData,
      metadata,
      source: 'user-service',
    });
  }

  async logPaymentProcessing(
    userId: string,
    paymentId: string,
    paymentData: any,
    metadata?: any,
  ): Promise<AuditLog> {
    return this.createLog({
      action: AuditAction.PAYMENT_PROCESSED,
      userId,
      entityType: 'Payment',
      entityId: paymentId,
      newValues: paymentData,
      metadata,
      source: 'payment-service',
    });
  }

  async logRoleUpdate(
    userId: string,
    targetUserId: string,
    oldRoles: string[],
    newRoles: string[],
    metadata?: any,
  ): Promise<AuditLog> {
    return this.createLog({
      action: AuditAction.ROLE_UPDATED,
      userId,
      entityType: 'UserRole',
      entityId: targetUserId,
      oldValues: { roles: oldRoles },
      newValues: { roles: newRoles },
      metadata,
      source: 'role-service',
    });
  }
}
