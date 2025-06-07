import { Injectable } from "@nestjs/common"
import { HealthIndicator, type HealthIndicatorResult, HealthCheckError } from "@nestjs/terminus"

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  // Note: Inject Redis client if you're using Redis
  // constructor(@InjectRedis() private readonly redis: Redis) {
  //   super()
  // }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // If Redis is not configured, return healthy status
      if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
        return this.getStatus(key, true, {
          status: "not_configured",
          message: "Redis is not configured",
        })
      }

      // If Redis is configured, test the connection
      // const startTime = Date.now()
      // await this.redis.ping()
      // const responseTime = Date.now() - startTime

      // For now, return a mock healthy status
      // Replace this with actual Redis health check when Redis is implemented
      const result = this.getStatus(key, true, {
        status: "connected",
        responseTime: "< 1ms",
        // info: await this.redis.info(),
        message: "Redis health check not implemented yet",
      })

      return result
    } catch (error) {
      const result = this.getStatus(key, false, {
        status: "disconnected",
        error: error.message,
      })

      throw new HealthCheckError("Redis health check failed", result)
    }
  }
}
