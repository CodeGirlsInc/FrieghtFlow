import { Injectable, type NestMiddleware, HttpException, HttpStatus } from "@nestjs/common"
import type { Request, Response, NextFunction } from "express"
import type { ConfigService } from "@nestjs/config"
import type { Cache } from "cache-manager"
import type { LoggerService } from "../../logger/services/logger.service"

@Injectable()
export class EmailRateLimitMiddleware implements NestMiddleware {
  private readonly rateLimitPerMinute: number
  private readonly rateLimitPerHour: number
  private readonly rateLimitPerDay: number

  constructor(
    private configService: ConfigService,
    private cacheManager: Cache,
    private loggerService: LoggerService,
  ) {
    this.rateLimitPerMinute = this.configService.get<number>("EMAIL_RATE_LIMIT_PER_MINUTE", 10)
    this.rateLimitPerHour = this.configService.get<number>("EMAIL_RATE_LIMIT_PER_HOUR", 100)
    this.rateLimitPerDay = this.configService.get<number>("EMAIL_RATE_LIMIT_PER_DAY", 1000)
  }

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || req.ip
      const now = new Date()

      // Check rate limits for different time windows
      const minuteKey = `email_rate_limit:${userId}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`
      const hourKey = `email_rate_limit:${userId}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
      const dayKey = `email_rate_limit:${userId}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

      const [minuteCount, hourCount, dayCount] = await Promise.all([
        this.cacheManager.get<number>(minuteKey) || 0,
        this.cacheManager.get<number>(hourKey) || 0,
        this.cacheManager.get<number>(dayKey) || 0,
      ])

      // Check if any rate limit is exceeded
      if (minuteCount >= this.rateLimitPerMinute) {
        this.loggerService.warn("Email rate limit exceeded (per minute)", {
          module: "EmailRateLimitMiddleware",
          userId,
          limit: this.rateLimitPerMinute,
          current: minuteCount,
          window: "minute",
        })
        throw new HttpException("Rate limit exceeded: too many emails per minute", HttpStatus.TOO_MANY_REQUESTS)
      }

      if (hourCount >= this.rateLimitPerHour) {
        this.loggerService.warn("Email rate limit exceeded (per hour)", {
          module: "EmailRateLimitMiddleware",
          userId,
          limit: this.rateLimitPerHour,
          current: hourCount,
          window: "hour",
        })
        throw new HttpException("Rate limit exceeded: too many emails per hour", HttpStatus.TOO_MANY_REQUESTS)
      }

      if (dayCount >= this.rateLimitPerDay) {
        this.loggerService.warn("Email rate limit exceeded (per day)", {
          module: "EmailRateLimitMiddleware",
          userId,
          limit: this.rateLimitPerDay,
          current: dayCount,
          window: "day",
        })
        throw new HttpException("Rate limit exceeded: too many emails per day", HttpStatus.TOO_MANY_REQUESTS)
      }

      // Increment counters
      await Promise.all([
        this.cacheManager.set(minuteKey, minuteCount + 1, 60), // 1 minute TTL
        this.cacheManager.set(hourKey, hourCount + 1, 3600), // 1 hour TTL
        this.cacheManager.set(dayKey, dayCount + 1, 86400), // 1 day TTL
      ])

      // Add rate limit headers
      res.setHeader("X-RateLimit-Limit-Minute", this.rateLimitPerMinute)
      res.setHeader("X-RateLimit-Remaining-Minute", Math.max(0, this.rateLimitPerMinute - minuteCount - 1))
      res.setHeader("X-RateLimit-Limit-Hour", this.rateLimitPerHour)
      res.setHeader("X-RateLimit-Remaining-Hour", Math.max(0, this.rateLimitPerHour - hourCount - 1))
      res.setHeader("X-RateLimit-Limit-Day", this.rateLimitPerDay)
      res.setHeader("X-RateLimit-Remaining-Day", Math.max(0, this.rateLimitPerDay - dayCount - 1))

      next()
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      this.loggerService.error("Email rate limit middleware error", error, {
        module: "EmailRateLimitMiddleware",
      })
      next(error)
    }
  }
}
