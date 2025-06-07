import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap } from "rxjs/operators"
import type { HealthService } from "../health.service"

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly healthService: HealthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const startTime = Date.now()

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime
        const method = request.method
        const route = request.route?.path || request.url
        const statusCode = response.statusCode

        // Record metrics
        this.healthService.recordHttpRequest(method, route, statusCode, duration)
      }),
    )
  }
}
