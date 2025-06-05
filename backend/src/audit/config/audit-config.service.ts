import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"

@Injectable()
export class AuditConfigService {
  constructor(private configService: ConfigService) {}

  get enableAuditLogging(): boolean {
    return this.configService.get<boolean>("AUDIT_LOGGING_ENABLED", true)
  }

  get logRetentionDays(): number {
    return this.configService.get<number>("AUDIT_LOG_RETENTION_DAYS", 365)
  }

  get enableAutoLogging(): boolean {
    return this.configService.get<boolean>("AUDIT_AUTO_LOGGING_ENABLED", true)
  }

  get logSensitiveData(): boolean {
    return this.configService.get<boolean>("AUDIT_LOG_SENSITIVE_DATA", false)
  }

  get maxLogSize(): number {
    return this.configService.get<number>("AUDIT_MAX_LOG_SIZE", 10000)
  }

  get enableRealTimeNotifications(): boolean {
    return this.configService.get<boolean>("AUDIT_REAL_TIME_NOTIFICATIONS", false)
  }

  get criticalEventsWebhook(): string {
    return this.configService.get<string>("AUDIT_CRITICAL_EVENTS_WEBHOOK", "")
  }
}
