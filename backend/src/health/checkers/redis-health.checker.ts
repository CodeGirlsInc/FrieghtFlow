import { Injectable, Logger } from '@nestjs/common';
import type {
  HealthChecker,
  HealthCheckResult,
} from '../interfaces/health-checker.interface';
import { HealthStatus } from '../entities/health-check.entity';

// Mock Redis client interface - replace with your actual Redis client
interface RedisClient {
  ping(): Promise<string>;
  info(): Promise<string>;
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    mode?: string,
    duration?: number,
  ): Promise<string>;
  del(key: string): Promise<number>;
  isReady: boolean;
}

@Injectable()
export class RedisHealthChecker implements HealthChecker {
  private readonly logger = new Logger(RedisHealthChecker.name);

  constructor() {} // @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient, // Inject your Redis client here

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Mock Redis client for demonstration
      // Replace this with your actual Redis client injection
      const redisClient = this.getMockRedisClient();

      if (!redisClient.isReady) {
        return {
          status: HealthStatus.UNHEALTHY,
          responseTime: Date.now() - startTime,
          errorMessage: 'Redis client not ready',
        };
      }

      // Test ping
      const pingResult = await redisClient.ping();
      const pingTime = Date.now() - startTime;

      // Test write/read operations
      const testKey = `health_check_${Date.now()}`;
      const testValue = 'health_test';

      const writeStartTime = Date.now();
      await redisClient.set(testKey, testValue, 'EX', 60); // Expire in 60 seconds
      const writeTime = Date.now() - writeStartTime;

      const readStartTime = Date.now();
      const readValue = await redisClient.get(testKey);
      const readTime = Date.now() - readStartTime;

      // Clean up test key
      await redisClient.del(testKey);

      const totalResponseTime = Date.now() - startTime;

      // Get Redis info
      const info = await redisClient.info();
      const redisInfo = this.parseRedisInfo(info);

      const details = {
        ping: pingResult,
        pingTime,
        writeTime,
        readTime,
        testSuccessful: readValue === testValue,
        version: redisInfo.redis_version,
        mode: redisInfo.redis_mode,
        connectedClients: redisInfo.connected_clients,
        usedMemory: redisInfo.used_memory_human,
        uptime: redisInfo.uptime_in_seconds,
      };

      // Determine status based on response time
      let status = HealthStatus.HEALTHY;
      if (totalResponseTime > 500) {
        status = HealthStatus.DEGRADED;
      }
      if (totalResponseTime > 2000 || readValue !== testValue) {
        status = HealthStatus.UNHEALTHY;
      }

      return {
        status,
        responseTime: totalResponseTime,
        details,
      };
    } catch (error) {
      this.logger.error('Redis health check failed', error.stack);
      return {
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        details: {
          error: error.name,
        },
      };
    }
  }

  getServiceName(): string {
    return 'redis';
  }

  private getMockRedisClient(): RedisClient {
    // Mock implementation - replace with actual Redis client
    return {
      isReady: true,
      ping: async () => 'PONG',
      info: async () =>
        'redis_version:7.0.0\nredis_mode:standalone\nconnected_clients:1\nused_memory_human:1.00M\nuptime_in_seconds:3600',
      get: async (key: string) =>
        key.includes('health_check') ? 'health_test' : null,
      set: async () => 'OK',
      del: async () => 1,
    };
  }

  private parseRedisInfo(info: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = info.split('\n');

    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        result[key.trim()] = value.trim();
      }
    }

    return result;
  }
}
