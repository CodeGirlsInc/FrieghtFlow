import type { HealthStatus } from '../entities/health-check.entity';

export interface HealthCheckResult {
  status: HealthStatus;
  responseTime: number;
  details?: Record<string, any>;
  errorMessage?: string;
}

export interface HealthChecker {
  check(): Promise<HealthCheckResult>;
  getServiceName(): string;
}
