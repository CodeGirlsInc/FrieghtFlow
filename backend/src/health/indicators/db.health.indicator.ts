import { Injectable } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class DbHealthIndicator {
  constructor(private db: TypeOrmHealthIndicator) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    return this.db.pingCheck(key);
  }
}
