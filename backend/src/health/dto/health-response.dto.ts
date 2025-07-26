import type {
  HealthStatus,
  ServiceType,
} from '../entities/health-check.entity';

export class ServiceHealthDto {
  serviceName: string;
  serviceType: ServiceType;
  status: HealthStatus;
  responseTime: number;
  details?: Record<string, any>;
  errorMessage?: string;
  checkedAt: Date;
}

export class OverallHealthDto {
  status: HealthStatus;
  timestamp: Date;
  uptime: number;
  version: string;
  environment: string;
  services: ServiceHealthDto[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export class HealthHistoryDto {
  serviceName: string;
  checks: Array<{
    status: HealthStatus;
    responseTime: number;
    checkedAt: Date;
    errorMessage?: string;
  }>;
}
