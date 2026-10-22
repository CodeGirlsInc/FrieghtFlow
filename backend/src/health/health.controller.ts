import { Controller, Get, Logger } from '@nestjs/common';
import { HealthService, HealthCheck, ReadyCheck } from './health.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  /**
   * Liveness: "is the process alive?" — used by the orchestrator to decide
   * whether to restart this container. Cheap: never touches the database,
   * because a liveness probe that depends on the DB would restart a healthy
   * pod whose database momentarily stalled.
   */
  @Public()
  @Get()
  getHealth(): HealthCheck {
    this.logger.debug('GET /health');
    return this.healthService.getHealth();
  }

  /**
   * Readiness: "can this pod accept traffic?" — used by the load balancer to
   * route requests. Performs a real `SELECT 1` so a broken database shows
   * `not_ready` instead of silently serving 5xxs.
   */
  @Public()
  @Get('ready')
  async getReady(): Promise<ReadyCheck> {
    this.logger.debug('GET /health/ready');
    return this.healthService.getReady();
  }
}