export enum AuditEventType {
  // Authentication Events
  LOGIN = "login",
  LOGOUT = "logout",
  LOGIN_FAILED = "login_failed",
  PASSWORD_CHANGE = "password_change",
  PASSWORD_RESET = "password_reset",

  // User Management
  USER_CREATED = "user_created",
  USER_UPDATED = "user_updated",
  USER_DELETED = "user_deleted",
  USER_ACTIVATED = "user_activated",
  USER_DEACTIVATED = "user_deactivated",
  PROFILE_UPDATED = "profile_updated",

  // Shipment Events
  SHIPMENT_CREATED = "shipment_created",
  SHIPMENT_UPDATED = "shipment_updated",
  SHIPMENT_STATUS_CHANGED = "shipment_status_changed",
  SHIPMENT_CANCELLED = "shipment_cancelled",
  SHIPMENT_DELIVERED = "shipment_delivered",

  // Payment Events
  PAYMENT_INITIATED = "payment_initiated",
  PAYMENT_COMPLETED = "payment_completed",
  PAYMENT_FAILED = "payment_failed",
  PAYMENT_REFUNDED = "payment_refunded",

  // System Events
  SYSTEM_STARTUP = "system_startup",
  SYSTEM_SHUTDOWN = "system_shutdown",
  SYSTEM_ERROR = "system_error",
  SYSTEM_WARNING = "system_warning",
  CONFIGURATION_CHANGED = "configuration_changed",

  // Security Events
  UNAUTHORIZED_ACCESS = "unauthorized_access",
  PERMISSION_DENIED = "permission_denied",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  DATA_BREACH_ATTEMPT = "data_breach_attempt",

  // Data Events
  DATA_CREATED = "data_created",
  DATA_UPDATED = "data_updated",
  DATA_DELETED = "data_deleted",
  DATA_EXPORTED = "data_exported",
  DATA_IMPORTED = "data_imported",

  // API Events
  API_REQUEST = "api_request",
  API_ERROR = "api_error",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",

  // Custom Events
  CUSTOM = "custom",
}

export enum AuditSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AuditStatus {
  SUCCESS = "success",
  FAILURE = "failure",
  WARNING = "warning",
  INFO = "info",
}

export interface AuditContext {
  userId?: string
  userEmail?: string
  userRole?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  requestId?: string
  correlationId?: string
  module?: string
  action?: string
  resource?: string
  resourceId?: string
  additionalData?: Record<string, any>
}

export interface AuditLogData {
  eventType: AuditEventType
  severity: AuditSeverity
  status: AuditStatus
  message: string
  context: AuditContext
  metadata?: Record<string, any>
  changes?: {
    before?: Record<string, any>
    after?: Record<string, any>
  }
}

export interface AuditLogFilter {
  eventType?: AuditEventType[]
  severity?: AuditSeverity[]
  status?: AuditStatus[]
  userId?: string
  userEmail?: string
  module?: string
  resource?: string
  startDate?: Date
  endDate?: Date
  ipAddress?: string
  searchTerm?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}

export interface AuditLogSummary {
  totalLogs: number
  logsBySeverity: Record<AuditSeverity, number>
  logsByStatus: Record<AuditStatus, number>
  logsByEventType: Record<AuditEventType, number>
  topUsers: Array<{ userId: string; userEmail: string; count: number }>
  topModules: Array<{ module: string; count: number }>
  recentCriticalEvents: number
}
