
import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';

@Module({
  controllers: [AdminStatsController],
  providers: [AdminStatsService],
})
export class AdminStatsModule {}