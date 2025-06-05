import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler, Logger } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import type { Reflector } from "@nestjs/core"
import type { AuditService } from "../audit.service"
import type { AuditConfigService } from "../config/audit-config.service"
import { AuditEventType, AuditSeverity, AuditStatus } from "../types/audit.types"
import { AUDIT_LOG_KEY } from "../decorators/audit-log.decorator"

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name)

  constructor(
    private readonly auditService: AuditService,
    private readonly configService: AuditConfigService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (!this.configService.enableAutoLogging) {
      return next.handle()
    }

    const auditMetadata = this.reflector.get(AUDIT_LOG_KEY, context.getHandler())
    if (!auditMetadata) {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest()
    const startTime = Date.now()

    const auditContext = {
      userId: request.user?.id,
      userEmail: request.user?.email,
      userRole: request.user?.role,
      sessionId: request.sessionID,
      ipAddress: request.ip || request.connection.remoteAddress,
      userAgent: request.get("User-Agent"),
      requestId: request.id,
      module: context.getClass().name.replace("Controller", "").toLowerCase(),
      action: context.getHandler().name,
      resource: auditMetadata.resource,
      additionalData: {
        method: request.method,
        url: request.url,
        params: request.params,
        query: request.query,
        ...(this.configService.logSensitiveData && { body: request.body }),
      },
    }

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime
        this.auditService.log({
          eventType: auditMetadata.eventType || AuditEventType.API_REQUEST,
          severity: auditMetadata.severity || AuditSeverity.LOW,
          status: AuditStatus.SUCCESS,
          message: auditMetadata.message || `${request.method} ${request.url} completed successfully`,
          context: auditContext,
          metadata: {
            duration,
            responseSize: JSON.stringify(response).length,
          },
        })
      }),
      catchError((error) => {
        const duration = Date.now() - startTime
        this.auditService.log({
          eventType: auditMetadata.eventType || AuditEventType.API_ERROR,
          severity: AuditSeverity.HIGH,
          status: AuditStatus.FAILURE,
          message: auditMetadata.message || `${request.method} ${request.url} failed: ${error.message}`,
          context: auditContext,
          metadata: {
            duration,
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          },
        })
        throw error
      }),
    )
  }
}
