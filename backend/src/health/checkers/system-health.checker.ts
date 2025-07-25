import { Injectable, Logger } from '@nestjs/common';
import * as os from 'os';
import * as fs from 'fs/promises';
import type {
  HealthChecker,
  HealthCheckResult,
} from '../interfaces/health-checker.interface';
import { HealthStatus } from '../entities/health-check.entity';

@Injectable()
export class SystemHealthChecker implements HealthChecker {
  private readonly logger = new Logger(SystemHealthChecker.name);

  async check(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Get system information
      const cpuUsage = process.cpuUsage();
      const memoryUsage = process.memoryUsage();
      const systemMemory = {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
      };

      // Calculate CPU usage percentage (approximate)
      const cpuPercent = this.calculateCpuUsage(cpuUsage);

      // Memory usage percentages
      const heapUsedPercent =
        (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      const systemMemoryUsedPercent =
        (systemMemory.used / systemMemory.total) * 100;

      // Check disk space
      const diskSpace = await this.getDiskSpace();

      // Get load average
      const loadAverage = os.loadavg();

      // Get uptime
      const uptime = process.uptime();
      const systemUptime = os.uptime();

      const details = {
        process: {
          pid: process.pid,
          uptime: Math.floor(uptime),
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        memory: {
          heap: {
            used: this.formatBytes(memoryUsage.heapUsed),
            total: this.formatBytes(memoryUsage.heapTotal),
            usedPercent: Math.round(heapUsedPercent * 100) / 100,
          },
          system: {
            total: this.formatBytes(systemMemory.total),
            free: this.formatBytes(systemMemory.free),
            used: this.formatBytes(systemMemory.used),
            usedPercent: Math.round(systemMemoryUsedPercent * 100) / 100,
          },
        },
        cpu: {
          usage: cpuPercent,
          loadAverage: loadAverage.map((load) => Math.round(load * 100) / 100),
          cores: os.cpus().length,
        },
        disk: diskSpace,
        system: {
          hostname: os.hostname(),
          uptime: Math.floor(systemUptime),
          platform: os.platform(),
          release: os.release(),
        },
      };

      // Determine health status based on system metrics
      let status = HealthStatus.HEALTHY;

      // Check critical thresholds
      if (
        heapUsedPercent > 90 ||
        systemMemoryUsedPercent > 95 ||
        (diskSpace?.usedPercent || 0) > 95
      ) {
        status = HealthStatus.UNHEALTHY;
      } else if (
        heapUsedPercent > 80 ||
        systemMemoryUsedPercent > 85 ||
        (diskSpace?.usedPercent || 0) > 85
      ) {
        status = HealthStatus.DEGRADED;
      }

      // Check load average (if available)
      if (loadAverage[0] > os.cpus().length * 2) {
        status =
          status === HealthStatus.HEALTHY
            ? HealthStatus.DEGRADED
            : HealthStatus.UNHEALTHY;
      }

      return {
        status,
        responseTime: Date.now() - startTime,
        details,
      };
    } catch (error) {
      this.logger.error('System health check failed', error.stack);
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
    return 'system';
  }

  private calculateCpuUsage(cpuUsage: NodeJS.CpuUsage): number {
    // This is a simplified CPU usage calculation
    // For more accurate results, you might want to use a library like 'pidusage'
    const totalUsage = cpuUsage.user + cpuUsage.system;
    return Math.round((totalUsage / 1000000) * 100) / 100; // Convert to percentage
  }

  private async getDiskSpace(): Promise<{
    total: string;
    free: string;
    used: string;
    usedPercent: number;
  } | null> {
    try {
      const stats = await fs.stat(process.cwd());
      // Note: fs.stat doesn't provide disk space info
      // You might want to use a library like 'check-disk-space' for accurate disk space monitoring
      return {
        total: 'N/A',
        free: 'N/A',
        used: 'N/A',
        usedPercent: 0,
      };
    } catch (error) {
      this.logger.warn('Could not get disk space information', error.message);
      return null;
    }
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
