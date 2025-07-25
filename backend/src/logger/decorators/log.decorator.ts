import { SetMetadata, createParamDecorator, type ExecutionContext } from "@nestjs/common"
import { LogLevel } from "../interfaces/logger.interface"

export const LOG_METADATA_KEY = "log_metadata"

export interface LogDecoratorOptions {
  level?: LogLevel
  message?: string
  includeArgs?: boolean
  includeResult?: boolean
  maskArgs?: string[]
  tags?: string[]
  audit?: boolean
  performance?: boolean
  sensitive?: boolean
}

export const Log = (options: LogDecoratorOptions = {}) => {
  return SetMetadata(LOG_METADATA_KEY, options)
}

export const LogContext = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return {
    requestId: request.id || request.headers["x-request-id"],
    userId: request.user?.id,
    sessionId: request.session?.id,
    userAgent: request.headers["user-agent"],
    ip: request.ip,
    method: request.method,
    url: request.url,
    module: ctx.getClass().name,
    component: ctx.getHandler().name,
  }
})

// Method decorator for automatic logging
export function LogMethod(options: LogDecoratorOptions = {}) {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const logger = this.logger || console // Fallback to console if no logger
      const startTime = Date.now()

      const context = {
        module: target.constructor.name,
        component: propertyName,
        operation: "method_call",
        tags: options.tags || [],
      }

      try {
        // Log method entry
        if (options.level !== LogLevel.TRACE) {
          logger.debug?.(`Entering ${target.constructor.name}.${propertyName}`, {
            ...context,
            args: options.includeArgs ? this.sanitizeArgs(args, options.maskArgs) : undefined,
          })
        }

        const result = await method.apply(this, args)
        const duration = Date.now() - startTime

        // Log method success
        const message = options.message || `${target.constructor.name}.${propertyName} completed`
        const logLevel = options.performance && duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG

        logger[logLevel]?.(message, {
          ...context,
          duration,
          result: options.includeResult ? result : undefined,
          tags: [...(options.tags || []), ...(options.performance ? ["performance"] : [])],
        })

        // Audit logging
        if (options.audit) {
          logger.info?.(`Audit: ${propertyName} executed`, {
            ...context,
            tags: [...(options.tags || []), "audit"],
            duration,
          })
        }

        return result
      } catch (error) {
        const duration = Date.now() - startTime

        // Log method error
        logger.error?.(`${target.constructor.name}.${propertyName} failed`, error, {
          ...context,
          duration,
          args: options.includeArgs ? this.sanitizeArgs(args, options.maskArgs) : undefined,
        })

        throw error
      }
    }

    return descriptor
  }
}

// Class decorator for automatic logging
export function LogClass(options: LogDecoratorOptions = {}) {
  return <T extends { new (...args: any[]): {} }>(constructor: T) =>
    class extends constructor {
      constructor(...args: any[]) {
        super(...args)

        // Add logging to all methods
        const prototype = constructor.prototype
        const methodNames = Object.getOwnPropertyNames(prototype).filter(
          (name) => name !== "constructor" && typeof prototype[name] === "function",
        )

        methodNames.forEach((methodName) => {
          const originalMethod = prototype[methodName]
          prototype[methodName] = function (...args: any[]) {
            const logger = this.logger || console
            const startTime = Date.now()

            try {
              const result = originalMethod.apply(this, args)
              const duration = Date.now() - startTime

              if (options.performance && duration > 100) {
                logger.warn?.(`Slow method: ${constructor.name}.${methodName} took ${duration}ms`)
              }

              return result
            } catch (error) {
              const duration = Date.now() - startTime
              logger.error?.(`Method ${constructor.name}.${methodName} failed after ${duration}ms`, error)
              throw error
            }
          }
        })
      }

      private sanitizeArgs(args: any[], maskFields: string[] = []): any[] {
        return args.map((arg) => {
          if (typeof arg === "object" && arg !== null) {
            const sanitized = { ...arg }
            maskFields.forEach((field) => {
              if (sanitized[field]) {
                sanitized[field] = "***MASKED***"
              }
            })
            return sanitized
          }
          return arg
        })
      }
    }
}
