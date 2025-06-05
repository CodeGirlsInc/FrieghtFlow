import { Injectable, Logger } from "@nestjs/common"
import type { AuditConfigService } from "./config/audit-config.service"
import type { AuditLogRepository } from "./repositories/audit-log.repository"
import type { AuditLogData, AuditLogFilter, AuditLogSummary, AuditContext } from "./types/audit.types"
import { AuditEventType, AuditSeverity, AuditStatus } from "./types/audit.types"
import type { AuditLog } from "./entities/audit-log.entity"

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(
    private readonly configService: AuditConfigService,
    private readonly auditRepository: AuditLogRepository,
  ) {}

  async log(auditData: AuditLogData): Promise<AuditLog | null> {
    if (!this.configService.enableAuditLogging) {
      return null
    }

    try {
      // Set expiration date based on retention policy
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + this.configService.logRetentionDays)

      const auditLog = await this.auditRepository.create({
        ...auditData,
        metadata: {
          ...auditData.metadata,
          expiresAt,
        },
      })

      // Handle critical events
      if (auditData.severity === AuditSeverity.CRITICAL) {
        await this.handleCriticalEvent(auditLog)
      }

      this.logger.debug(`Audit log created: ${auditLog.id}`)
      return auditLog
    } catch (error) {
      this.logger.error("Failed to create audit log", error)
      return null
    }
  }

  // Convenience methods for common events
  async logLogin(userId: string, userEmail: string, context: Partial<AuditContext> = {}): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.LOGIN,
      severity: AuditSeverity.LOW,
      status: AuditStatus.SUCCESS,
      message: `User ${userEmail} logged in successfully`,
      context: {
        userId,
        userEmail,
        module: "auth",
        action: "login",
        ...context,
      },
    })
  }

  async logLogout(userId: string, userEmail: string, context: Partial<AuditContext> = {}): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.LOGOUT,
      severity: AuditSeverity.LOW,
      status: AuditStatus.SUCCESS,
      message: `User ${userEmail} logged out`,
      context: {
        userId,
        userEmail,
        module: "auth",
        action: "logout",
        ...context,
      },
    })
  }

  async logFailedLogin(
    userEmail: string,
    reason: string,
    context: Partial<AuditContext> = {},
  ): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.LOGIN_FAILED,
      severity: AuditSeverity.MEDIUM,
      status: AuditStatus.FAILURE,
      message: `Failed login attempt for ${userEmail}: ${reason}`,
      context: {
        userEmail,
        module: "auth",
        action: "login",
        ...context,
      },
    })
  }

  async logProfileUpdate(
    userId: string,
    userEmail: string,
    changes: { before: any; after: any },
    context: Partial<AuditContext> = {},
  ): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.PROFILE_UPDATED,
      severity: AuditSeverity.LOW,
      status: AuditStatus.SUCCESS,
      message: `User ${userEmail} updated their profile`,
      context: {
        userId,
        userEmail,
        module: "user",
        action: "update_profile",
        resource: "user_profile",
        resourceId: userId,
        ...context,
      },
      changes,
    })
  }

  async logShipmentUpdate(
    shipmentId: string,
    userId: string,
    userEmail: string,
    changes: { before: any; after: any },
    context: Partial<AuditContext> = {},
  ): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.SHIPMENT_UPDATED,
      severity: AuditSeverity.MEDIUM,
      status: AuditStatus.SUCCESS,
      message: `Shipment ${shipmentId} updated by ${userEmail}`,
      context: {
        userId,
        userEmail,
        module: "shipment",
        action: "update",
        resource: "shipment",
        resourceId: shipmentId,
        ...context,
      },
      changes,
    })
  }

  async logShipmentStatusChange(
    shipmentId: string,
    oldStatus: string,
    newStatus: string,
    userId: string,
    userEmail: string,
    context: Partial<AuditContext> = {},
  ): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.SHIPMENT_STATUS_CHANGED,
      severity: AuditSeverity.MEDIUM,
      status: AuditStatus.SUCCESS,
      message: `Shipment ${shipmentId} status changed from ${oldStatus} to ${newStatus}`,
      context: {
        userId,
        userEmail,
        module: "shipment",
        action: "status_change",
        resource: "shipment",
        resourceId: shipmentId,
        ...context,
      },
      changes: {
        before: { status: oldStatus },
        after: { status: newStatus },
      },
    })
  }

  async logSystemWarning(
    message: string,
    module: string,
    context: Partial<AuditContext> = {},
  ): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.SYSTEM_WARNING,
      severity: AuditSeverity.HIGH,
      status: AuditStatus.WARNING,
      message: `System warning in ${module}: ${message}`,
      context: {
        module,
        action: "system_warning",
        ...context,
      },
    })
  }

  async logSystemError(error: Error, module: string, context: Partial<AuditContext> = {}): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.SYSTEM_ERROR,
      severity: AuditSeverity.CRITICAL,
      status: AuditStatus.FAILURE,
      message: `System error in ${module}: ${error.message}`,
      context: {
        module,
        action: "system_error",
        ...context,
      },
      metadata: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      },
    })
  }

  async logUnauthorizedAccess(
    resource: string,
    userId?: string,
    userEmail?: string,
    context: Partial<AuditContext> = {},
  ): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.UNAUTHORIZED_ACCESS,
      severity: AuditSeverity.HIGH,
      status: AuditStatus.FAILURE,
      message: `Unauthorized access attempt to ${resource}${userEmail ? ` by ${userEmail}` : ""}`,
      context: {
        userId,
        userEmail,
        module: "security",
        action: "unauthorized_access",
        resource,
        ...context,
      },
    })
  }

  async logDataExport(
    dataType: string,
    userId: string,
    userEmail: string,
    recordCount: number,
    context: Partial<AuditContext> = {},
  ): Promise<AuditLog | null> {
    return this.log({
      eventType: AuditEventType.DATA_EXPORTED,
      severity: AuditSeverity.MEDIUM,
      status: AuditStatus.SUCCESS,
      message: `User ${userEmail} exported ${recordCount} ${dataType} records`,
      context: {
        userId,
        userEmail,
        module: "data",
        action: "export",
        resource: dataType,
        ...context,
      },
      metadata: {
        recordCount,
        dataType,
      },
    })
  }

  async findLogs(filter: AuditLogFilter): Promise<{ logs: AuditLog[]; total: number }> {
    return this.auditRepository.findWithFilters(filter)
  }

  async findLogById(id: string): Promise<AuditLog | null> {
    return this.auditRepository.findById(id)
  }

  async findUserLogs(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.findByUserId(userId, limit)
  }

  async getCriticalEvents(hours = 24): Promise<AuditLog[]> {
    return this.auditRepository.findCriticalEvents(hours)
  }

  async getSummary(days = 30): Promise<AuditLogSummary> {
    return this.auditRepository.getSummary(days)
  }

  async cleanupExpiredLogs(): Promise<number> {
    const deletedCount = await this.auditRepository.deleteExpiredLogs()
    this.logger.log(`Cleaned up ${deletedCount} expired audit logs`)
    return deletedCount
  }

  async cleanupOldLogs(days?: number): Promise<number> {
    const retentionDays = days || this.configService.logRetentionDays
    const deletedCount = await this.auditRepository.deleteOldLogs(retentionDays)
    this.logger.log(`Cleaned up ${deletedCount} old audit logs (older than ${retentionDays} days)`)
    return deletedCount
  }

  private async handleCriticalEvent(auditLog: AuditLog): Promise<void> {
    this.logger.warn(`Critical audit event: ${auditLog.message}`, {
      eventType: auditLog.eventType,
      userId: auditLog.userId,
      module: auditLog.module,
    })

    // Send webhook notification if configured
    if (this.configService.criticalEventsWebhook) {
      try {
        await fetch(this.configService.criticalEventsWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event: "critical_audit_event",
            data: {
              id: auditLog.id,
              eventType: auditLog.eventType,
              message: auditLog.message,
              userId: auditLog.userId,
              userEmail: auditLog.userEmail,
              module: auditLog.module,
              createdAt: auditLog.createdAt,
            },
          }),
        })
      } catch (error) {
        this.logger.error("Failed to send critical event webhook", error)
      }
    }
  }
}
