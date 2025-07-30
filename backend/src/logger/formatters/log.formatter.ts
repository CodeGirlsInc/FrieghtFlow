import { Injectable } from "@nestjs/common"
import { format } from "winston"
import { type LogContext, LogFormat } from "../interfaces/logger.interface"
import * as os from "os"

@Injectable()
export class LogFormatter {
  private readonly hostname = os.hostname()
  private readonly processId = process.pid

  createFormat(logFormat: LogFormat, colorize = false, prettyPrint = false) {
    const formats = []

    // Add timestamp
    formats.push(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }))

    // Add errors format
    formats.push(format.errors({ stack: true }))

    // Add custom format based on type
    switch (logFormat) {
      case LogFormat.JSON:
        formats.push(this.createJsonFormat())
        break
      case LogFormat.SIMPLE:
        formats.push(this.createSimpleFormat())
        break
      case LogFormat.COMBINED:
        formats.push(this.createCombinedFormat())
        break
      default:
        formats.push(this.createJsonFormat())
    }

    // Add colorization for console
    if (colorize) {
      formats.push(format.colorize({ all: true }))
    }

    // Add pretty printing for development
    if (prettyPrint) {
      formats.push(format.prettyPrint({ colorize: true, depth: 3 }))
    }

    return format.combine(...formats)
  }

  private createJsonFormat() {
    return format.printf((info) => {
      const logEntry = {
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        hostname: this.hostname,
        processId: this.processId,
        environment: process.env.NODE_ENV || "development",
        version: process.env.APP_VERSION || "1.0.0",
        ...this.extractContext(info),
        ...(info.error && {
          error: {
            name: info.error.name,
            message: info.error.message,
            stack: info.error.stack,
          },
        }),
        ...(info.duration && { duration: info.duration }),
        ...(info.tags && { tags: info.tags }),
        ...(info.metadata && { metadata: info.metadata }),
      }

      return JSON.stringify(logEntry)
    })
  }

  private createSimpleFormat() {
    return format.printf((info) => {
      const context = this.extractContext(info)
      const contextStr = context.requestId ? `[${context.requestId}] ` : ""
      const moduleStr = context.module ? `[${context.module}] ` : ""

      return `${info.timestamp} [${info.level.toUpperCase()}] ${contextStr}${moduleStr}${info.message}`
    })
  }

  private createCombinedFormat() {
    return format.printf((info) => {
      const context = this.extractContext(info)
      const baseLog = {
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        hostname: this.hostname,
        processId: this.processId,
        ...context,
      }

      if (info.error) {
        baseLog["error"] = {
          name: info.error.name,
          message: info.error.message,
          stack: info.error.stack,
        }
      }

      return JSON.stringify(baseLog)
    })
  }

  private extractContext(info: any): Partial<LogContext> {
    const context: Partial<LogContext> = {}

    if (info.userId) context.userId = info.userId
    if (info.sessionId) context.sessionId = info.sessionId
    if (info.requestId) context.requestId = info.requestId
    if (info.traceId) context.traceId = info.traceId
    if (info.spanId) context.spanId = info.spanId
    if (info.operation) context.operation = info.operation
    if (info.module) context.module = info.module
    if (info.component) context.component = info.component

    return context
  }

  sanitizeData(data: any, sensitiveFields: string[]): any {
    if (!data || typeof data !== "object") {
      return data
    }

    const sanitized = { ...data }

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = this.maskValue(sanitized[field])
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key], sensitiveFields)
      }
    }

    return sanitized
  }

  private maskValue(value: any): string {
    if (typeof value === "string") {
      if (value.length <= 4) {
        return "****"
      }
      return value.substring(0, 2) + "*".repeat(value.length - 4) + value.substring(value.length - 2)
    }
    return "****"
  }
}
