import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap } from "rxjs/operators"
import type { AnalyticsService } from "../analytics.service"
import { EventType } from "../entities/analytics-event.entity"

@Injectable()
export class AnalyticsInterceptor implements NestInterceptor {
  constructor(private readonly analyticsService: AnalyticsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, user, headers } = request

    // Track page views for GET requests
    if (method === "GET" && !url.includes("/api/")) {
      this.analyticsService.trackEvent({
        eventType: EventType.PAGE_VIEW,
        userId: user?.id,
        sessionId: headers["x-session-id"],
        properties: {
          url,
          method,
          userAgent: headers["user-agent"],
        },
      })
    }

    return next.handle().pipe(
      tap(() => {
        // Track successful API calls
        if (url.includes("/api/")) {
          this.analyticsService.trackEvent({
            eventType: EventType.BUTTON_CLICK,
            userId: user?.id,
            sessionId: headers["x-session-id"],
            properties: {
              endpoint: url,
              method,
            },
          })
        }
      }),
    )
  }
}
