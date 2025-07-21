import { SetMetadata } from "@nestjs/common"
import type { AuditAction } from "../entities/audit-log.entity"

export const AUDIT_KEY = "audit"

export interface AuditOptions {
  action: AuditAction
  entityType?: string
  includeBody?: boolean
  includeResult?: boolean
}

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options)
