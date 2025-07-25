import { Injectable, Logger } from '@nestjs/common';
import type {
  HealthChecker,
  HealthCheckResult,
} from '../interfaces/health-checker.interface';
import { HealthStatus } from '../entities/health-check.entity';

interface ExternalApiConfig {
  name: string;
  url: string;
  timeout?: number;
  expectedStatus?: number;
  headers?: Record<string, string>;
}

@Injectable()
export class ExternalApiHealthChecker implements HealthChecker {
  private readonly logger = new Logger(ExternalApiHealthChecker.name);
  private readonly apis: ExternalApiConfig[] = [
    {
      name: 'example-api',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      timeout: 5000,
      expectedStatus: 200,
    },
    // Add more external APIs to monitor
  ];

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const results: Record<string, any> = {};

    try {
      const checkPromises = this.apis.map(async (api) => {
        const apiStartTime = Date.now();
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(
            () => controller.abort(),
            api.timeout || 5000,
          );

          const response = await fetch(api.url, {
            signal: controller.signal,
            headers: api.headers || {},
          });

          clearTimeout(timeoutId);

          const responseTime = Date.now() - apiStartTime;
          const isHealthy = response.status === (api.expectedStatus || 200);

          results[api.name] = {
            status: isHealthy ? 'healthy' : 'unhealthy',
            responseTime,
            httpStatus: response.status,
            url: api.url,
          };

          return isHealthy;
        } catch (error) {
          results[api.name] = {
            status: 'unhealthy',
            responseTime: Date.now() - apiStartTime,
            error: error.message,
            url: api.url,
          };
          return false;
        }
      });

      const apiResults = await Promise.all(checkPromises);
      const totalResponseTime = Date.now() - startTime;

      const healthyCount = apiResults.filter(Boolean).length;
      const totalCount = apiResults.length;

      let status = HealthStatus.HEALTHY;
      if (healthyCount < totalCount) {
        status =
          healthyCount === 0 ? HealthStatus.UNHEALTHY : HealthStatus.DEGRADED;
      }

      return {
        status,
        responseTime: totalResponseTime,
        details: {
          totalApis: totalCount,
          healthyApis: healthyCount,
          apis: results,
        },
      };
    } catch (error) {
      this.logger.error('External API health check failed', error.stack);
      return {
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        details: {
          error: error.name,
          apis: results,
        },
      };
    }
  }

  getServiceName(): string {
    return 'external-apis';
  }
}
