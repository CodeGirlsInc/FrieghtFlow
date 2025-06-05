import { SetMetadata } from "@nestjs/common"
import type { AuditEventType, AuditSeverity } from "../types/audit.types"

export const AUDIT_LOG_KEY = "audit_log"

export interface AuditLogOptions {
  eventType?: AuditEventType
  severity?: AuditSeverity
  message?: string
  resource?: string
}

export const AuditLog = (options: AuditLogOptions = {}) => SetMetadata(AUDIT_LOG_KEY, options)
