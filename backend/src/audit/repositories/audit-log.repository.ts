import { Injectable } from "@nestjs/common"
import type { Repository, SelectQueryBuilder } from "typeorm"
import type { AuditLog } from "../entities/audit-log.entity"
import type { AuditLogData, AuditLogFilter, AuditLogSummary } from "../types/audit.types"
import { AuditEventType, AuditSeverity, AuditStatus } from "../types/audit.types"

@Injectable()
export class AuditLogRepository {
  constructor(private readonly repository: Repository<AuditLog>) {}

  async create(auditData: AuditLogData): Promise<AuditLog> {
    const auditLog = this.repository.create({
      eventType: auditData.eventType,
      severity: auditData.severity,
      status: auditData.status,
      message: auditData.message,
      userId: auditData.context.userId,
      userEmail: auditData.context.userEmail,
      userRole: auditData.context.userRole,
      sessionId: auditData.context.sessionId,
      ipAddress: auditData.context.ipAddress,
      userAgent: auditData.context.userAgent,
      requestId: auditData.context.requestId,
      correlationId: auditData.context.correlationId,
      module: auditData.context.module,
      action: auditData.context.action,
      resource: auditData.context.resource,
      resourceId: auditData.context.resourceId,
      additionalData: auditData.context.additionalData,
      metadata: auditData.metadata,
      changes: auditData.changes,
    })

    return this.repository.save(auditLog)
  }

  async findWithFilters(filter: AuditLogFilter): Promise<{ logs: AuditLog[]; total: number }> {
    const queryBuilder = this.repository.createQueryBuilder("audit")

    this.applyFilters(queryBuilder, filter)

    // Pagination
    const page = filter.page || 1
    const limit = filter.limit || 50
    const offset = (page - 1) * limit

    queryBuilder.skip(offset).take(limit)

    // Sorting
    const sortBy = filter.sortBy || "createdAt"
    const sortOrder = filter.sortOrder || "DESC"
    queryBuilder.orderBy(`audit.${sortBy}`, sortOrder)

    const [logs, total] = await queryBuilder.getManyAndCount()

    return { logs, total }
  }

  async findById(id: string): Promise<AuditLog | null> {
    return this.repository.findOne({ where: { id } })
  }

  async findByUserId(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: limit,
    })
  }

  async findCriticalEvents(hours = 24): Promise<AuditLog[]> {
    const since = new Date()
    since.setHours(since.getHours() - hours)

    return this.repository.find({
      where: {
        severity: AuditSeverity.CRITICAL,
        createdAt: since as any,
      },
      order: { createdAt: "DESC" },
    })
  }

  async getSummary(days = 30): Promise<AuditLogSummary> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const queryBuilder = this.repository.createQueryBuilder("audit").where("audit.createdAt >= :since", { since })

    // Total logs
    const totalLogs = await queryBuilder.getCount()

    // Logs by severity
    const severityResults = await queryBuilder
      .select("audit.severity", "severity")
      .addSelect("COUNT(*)", "count")
      .groupBy("audit.severity")
      .getRawMany()

    const logsBySeverity = Object.values(AuditSeverity).reduce(
      (acc, severity) => {
        acc[severity] = 0
        return acc
      },
      {} as Record<AuditSeverity, number>,
    )

    severityResults.forEach((result) => {
      logsBySeverity[result.severity as AuditSeverity] = Number.parseInt(result.count)
    })

    // Logs by status
    const statusResults = await queryBuilder
      .select("audit.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("audit.status")
      .getRawMany()

    const logsByStatus = Object.values(AuditStatus).reduce(
      (acc, status) => {
        acc[status] = 0
        return acc
      },
      {} as Record<AuditStatus, number>,
    )

    statusResults.forEach((result) => {
      logsByStatus[result.status as AuditStatus] = Number.parseInt(result.count)
    })

    // Logs by event type
    const eventTypeResults = await queryBuilder
      .select("audit.eventType", "eventType")
      .addSelect("COUNT(*)", "count")
      .groupBy("audit.eventType")
      .getRawMany()

    const logsByEventType = Object.values(AuditEventType).reduce(
      (acc, eventType) => {
        acc[eventType] = 0
        return acc
      },
      {} as Record<AuditEventType, number>,
    )

    eventTypeResults.forEach((result) => {
      logsByEventType[result.eventType as AuditEventType] = Number.parseInt(result.count)
    })

    // Top users
    const topUsers = await queryBuilder
      .select("audit.userId", "userId")
      .addSelect("audit.userEmail", "userEmail")
      .addSelect("COUNT(*)", "count")
      .where("audit.userId IS NOT NULL")
      .groupBy("audit.userId, audit.userEmail")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany()

    // Top modules
    const topModules = await queryBuilder
      .select("audit.module", "module")
      .addSelect("COUNT(*)", "count")
      .where("audit.module IS NOT NULL")
      .groupBy("audit.module")
      .orderBy("COUNT(*)", "DESC")
      .limit(10)
      .getRawMany()

    // Recent critical events
    const recentCritical = new Date()
    recentCritical.setHours(recentCritical.getHours() - 24)

    const recentCriticalEvents = await this.repository.count({
      where: {
        severity: AuditSeverity.CRITICAL,
        createdAt: recentCritical as any,
      },
    })

    return {
      totalLogs,
      logsBySeverity,
      logsByStatus,
      logsByEventType,
      topUsers: topUsers.map((user) => ({
        userId: user.userId,
        userEmail: user.userEmail,
        count: Number.parseInt(user.count),
      })),
      topModules: topModules.map((module) => ({
        module: module.module,
        count: Number.parseInt(module.count),
      })),
      recentCriticalEvents,
    }
  }

  async deleteExpiredLogs(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where("expiresAt IS NOT NULL AND expiresAt < :now", { now: new Date() })
      .execute()

    return result.affected || 0
  }

  async deleteOldLogs(days: number): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where("createdAt < :cutoffDate", { cutoffDate })
      .execute()

    return result.affected || 0
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<AuditLog>, filter: AuditLogFilter): void {
    if (filter.eventType && filter.eventType.length > 0) {
      queryBuilder.andWhere("audit.eventType IN (:...eventTypes)", { eventTypes: filter.eventType })
    }

    if (filter.severity && filter.severity.length > 0) {
      queryBuilder.andWhere("audit.severity IN (:...severities)", { severities: filter.severity })
    }

    if (filter.status && filter.status.length > 0) {
      queryBuilder.andWhere("audit.status IN (:...statuses)", { statuses: filter.status })
    }

    if (filter.userId) {
      queryBuilder.andWhere("audit.userId = :userId", { userId: filter.userId })
    }

    if (filter.userEmail) {
      queryBuilder.andWhere("audit.userEmail ILIKE :userEmail", { userEmail: `%${filter.userEmail}%` })
    }

    if (filter.module) {
      queryBuilder.andWhere("audit.module = :module", { module: filter.module })
    }

    if (filter.resource) {
      queryBuilder.andWhere("audit.resource = :resource", { resource: filter.resource })
    }

    if (filter.ipAddress) {
      queryBuilder.andWhere("audit.ipAddress = :ipAddress", { ipAddress: filter.ipAddress })
    }

    if (filter.startDate) {
      queryBuilder.andWhere("audit.createdAt >= :startDate", { startDate: filter.startDate })
    }

    if (filter.endDate) {
      queryBuilder.andWhere("audit.createdAt <= :endDate", { endDate: filter.endDate })
    }

    if (filter.searchTerm) {
      queryBuilder.andWhere(
        "(audit.message ILIKE :searchTerm OR audit.userEmail ILIKE :searchTerm OR audit.resource ILIKE :searchTerm)",
        { searchTerm: `%${filter.searchTerm}%` },
      )
    }
  }
}
