import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, concatMap, defer, map } from 'rxjs';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { UserRole } from '../common/enums/role.enum';
import { User } from '../users/entities/user.entity';
import type { AuditMetadataCarrier } from './audit-metadata';

const MUTATING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: User } & AuditMetadataCarrier>();
    const user = req.user;

    if (!user || user.role !== UserRole.ADMIN) return next.handle();
    if (!MUTATING_METHODS.has(req.method)) return next.handle();

    const route = req.route as { path?: string } | undefined;
    const action = `${req.method} ${route?.path ?? req.path}`;
    const params = req.params as Record<string, string>;
    return next.handle().pipe(
      concatMap((response) =>
        defer(() => {
          const targetId =
            req.auditTargetId ?? params?.id ?? params?.shipmentId ?? null;
          return Promise.resolve(
            this.auditLogService.log({
              adminId: user.id,
              action,
              ...(req.auditTargetType
                ? { targetType: req.auditTargetType }
                : {}),
              targetId,
              metadata: {
                body: req.body as Record<string, unknown>,
                query: req.query as Record<string, unknown>,
                ...(req.auditMetadata ?? {}),
              },
            }),
          );
        }).pipe(map(() => response as unknown)),
      ),
    );
  }
}
