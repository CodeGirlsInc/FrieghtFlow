import {
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
  Logger,
} from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import type { AuditLogService } from '../audit-log.service';
import { AUDIT_KEY, type AuditOptions } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, ip, headers, body, params, query } = request;

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const auditData = {
            action: auditOptions.action,
            userId: user?.id || user?.sub,
            userEmail: user?.email,
            entityType: auditOptions.entityType,
            entityId: params?.id || body?.id || result?.id,
            ipAddress: ip,
            userAgent: headers['user-agent'],
            metadata: {
              endpoint: request.url,
              method: request.method,
              params,
              query,
              ...(auditOptions.includeBody && { requestBody: body }),
              ...(auditOptions.includeResult && { result }),
            },
          };

          if (auditOptions.includeBody && body) {
            auditData.newValues = body;
          }

          await this.auditLogService.createLog(auditData);
        } catch (error) {
          this.logger.error(
            `Failed to create audit log: ${error.message}`,
            error.stack,
          );
        }
      }),
      catchError(async (error) => {
        try {
          await this.auditLogService.createLog({
            action: auditOptions.action,
            userId: user?.id || user?.sub,
            userEmail: user?.email,
            entityType: auditOptions.entityType,
            ipAddress: ip,
            userAgent: headers['user-agent'],
            metadata: {
              endpoint: request.url,
              method: request.method,
              error: error.message,
              params,
              query,
            },
          });
        } catch (auditError) {
          this.logger.error(
            `Failed to create error audit log: ${auditError.message}`,
          );
        }
        throw error;
      }),
    );
  }
}
