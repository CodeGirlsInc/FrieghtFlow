import { Injectable, type NestMiddleware } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import type { LoggerService } from "../services/logger.service"
import { v4 as uuidv4 } from "uuid"

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const requestId = (req.headers["x-request-id"] as string) || uuidv4()
    const traceId = (req.headers["x-trace-id"] as string) || uuidv4()
    const spanId = (req.headers["x-span-id"] as string) || uuidv4()

    // Set headers for downstream services
    res.setHeader("X-Request-ID", requestId)
    res.setHeader("X-Trace-ID", traceId)
    res.setHeader("X-Span-ID", spanId)

    const context = {
      requestId,
      traceId,
      spanId,
      userId: (req as any).user?.id,
      sessionId: (req as any).session?.id,
      method: req.method,
      url: req.url,
      userAgent: req.headers["user-agent"],
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date(),
    }

    // Run the request within the context
    this.loggerService.runWithContext(context, () => {
      next()
    })
  }
}
