import { Injectable, type NestInterceptor, type ExecutionContext, type CallHandler, Logger } from "@nestjs/common"
import type { Observable } from "rxjs"
import { tap, catchError } from "rxjs/operators"
import type { LoggerService } from "../services/logger.service"
import { LogLevel } from "../interfaces/logger.interface"
import { v4 as uuidv4 } from "uuid"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()
    const startTime = Date.now()

    // Generate request ID if not present
    const requestId = request.headers["x-request-id"] || uuidv4()
    request.id = requestId
    response.setHeader("X-Request-ID", requestId)

    const logContext = {
      requestId,
      userId: request.user?.id,
      sessionId: request.session?.id,
      method: request.method,
      url: request.url,
      userAgent: request.headers["user-agent"],
      ip: request.ip || request.connection.remoteAddress,
      module: context.getClass().name,
      component: context.getHandler().name,
    }

    // Log incoming request
    this.loggerService.info("Incoming request", {
      ...logContext,
      headers: this.sanitizeHeaders(request.headers),
      query: request.query,
      body: this.sanitizeBody(request.body),
      tags: ["http", "request"],
    })

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime
        const statusCode = response.statusCode

        // Determine log level based on status code and duration
        let level = LogLevel.INFO
        if (statusCode >= 400) {
          level = LogLevel.WARN
        }
        if (statusCode >= 500) {
          level = LogLevel.ERROR
        }
        if (duration > 5000) {
          level = LogLevel.WARN
        }

        this.loggerService.log({
          level,
          message: "Request completed",
          context: {
            ...logContext,
            statusCode,
            responseSize: JSON.stringify(data || {}).length,
            tags: ["http", "response", "success"],
          },
          duration,
        })

        // Performance logging
        if (duration > 1000) {
          this.loggerService.performance("HTTP Request", duration, logContext)
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime
        const statusCode = error.status || 500

        this.loggerService.error("Request failed", error, {
          ...logContext,
          statusCode,
          errorName: error.name,
          errorMessage: error.message,
          tags: ["http", "response", "error"],
          duration,
        })

        throw error
      }),
    )
  }

  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key", "x-auth-token"]
    const sanitized = { ...headers }

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = "***MASKED***"
      }
    })

    return sanitized
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== "object") {
      return body
    }

    const sensitiveFields = ["password", "token", "secret", "key", "authorization"]
    const sanitized = { ...body }

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "***MASKED***"
      }
    })

    return sanitized
  }
}
