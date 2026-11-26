import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'typeorm';

export interface HealthCheck {
  status: 'ok' | 'degraded';
  checks: Record<string, 'up' | 'down'>;
}

export interface ReadyCheck {
  status: 'ready' | 'not_ready';
  checks: Record<string, 'up' | 'down'>;
}

/**
 * Liveness/readiness probes for container orchestrators and load balancers.
 *
 * Both endpoints are `@Public()` — they must never require a JWT, so a
 * healthy-but-unauthenticated probe can always distinguish "the process is
 * running" from "the process can serve traffic".
 *
 * The readiness check pings the database with a real `SELECT 1` rather than
 * trusting TypeORM's `isConnected` flag: a stale/pooled connection that the
 * driver has not actually validated would otherwise report ready while the
 * first real query fails.
 */
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly connection: Connection) {}

  async getHealth(): Promise<HealthCheck> {
    const db = await this.checkDatabase();
    return {
      status: db ? 'ok' : 'degraded',
      checks: { database: db ? 'up' : 'down' },
    };
  }

  async getReady(): Promise<ReadyCheck> {
    const db = await this.checkDatabase();
    return {
      status: db ? 'ready' : 'not_ready',
      checks: { database: db ? 'up' : 'down' },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    if (!this.connection.isConnected) return false;
    try {
      await this.connection.query('SELECT 1');
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Health check database probe failed: ${message}`);
      return false;
    }
  }
}