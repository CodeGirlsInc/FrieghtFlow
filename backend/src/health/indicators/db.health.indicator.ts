import { Injectable } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthCheckResult } from '@nestjs/terminus';

@Injectable()
export class DbHealthIndicator {
  constructor(private db: TypeOrmHealthIndicator) {}

  async isHealthy(key: string): Promise<HealthCheckResult> {
    return this.db.pingCheck(key);
  }
}
