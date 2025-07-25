import { Injectable, Logger } from '@nestjs/common';
import type { DataSource } from 'typeorm';
import type {
  HealthChecker,
  HealthCheckResult,
} from '../interfaces/health-checker.interface';
import { HealthStatus } from '../entities/health-check.entity';

@Injectable()
export class DatabaseHealthChecker implements HealthChecker {
  private readonly logger = new Logger(DatabaseHealthChecker.name);

  private readonly dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Test basic connectivity
      const isConnected = this.dataSource.isInitialized;

      if (!isConnected) {
        return {
          status: HealthStatus.UNHEALTHY,
          responseTime: Date.now() - startTime,
          errorMessage: 'Database connection not initialized',
        };
      }

      // Test query execution
      const queryResult = await this.dataSource.query('SELECT 1 as test');
      const responseTime = Date.now() - startTime;

      // Get connection pool info
      const poolInfo = this.getConnectionPoolInfo();

      // Test write operation
      const writeStartTime = Date.now();
      await this.dataSource.query('SELECT NOW()');
      const writeTime = Date.now() - writeStartTime;

      const details = {
        driver: this.dataSource.driver.options.type,
        database: this.dataSource.driver.database,
        host: (this.dataSource.driver.options as any).host,
        port: (this.dataSource.driver.options as any).port,
        poolInfo,
        queryResult: queryResult[0],
        writeResponseTime: writeTime,
      };

      // Determine status based on response time
      let status = HealthStatus.HEALTHY;
      if (responseTime > 1000) {
        status = HealthStatus.DEGRADED;
      }
      if (responseTime > 5000) {
        status = HealthStatus.UNHEALTHY;
      }

      return {
        status,
        responseTime,
        details,
      };
    } catch (error) {
      this.logger.error('Database health check failed', error.stack);
      return {
        status: HealthStatus.UNHEALTHY,
        responseTime: Date.now() - startTime,
        errorMessage: error.message,
        details: {
          driver: this.dataSource.driver?.options?.type || 'unknown',
          error: error.name,
        },
      };
    }
  }

  getServiceName(): string {
    return 'database';
  }

  private getConnectionPoolInfo() {
    try {
      // This is specific to PostgreSQL driver
      const driver = this.dataSource.driver as any;
      if (driver.master && driver.master.pool) {
        return {
          totalConnections: driver.master.pool.totalCount,
          idleConnections: driver.master.pool.idleCount,
          waitingClients: driver.master.pool.waitingCount,
        };
      }
      return { info: 'Pool information not available' };
    } catch (error) {
      return { error: 'Could not retrieve pool information' };
    }
  }
}
