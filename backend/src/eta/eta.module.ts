import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ETACalculation } from './entities/eta-calculation.entity';
import { ETAService } from './eta.service';
import { ETAController } from './eta.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ETACalculation])],
  controllers: [ETAController],
  providers: [ETAService],
  exports: [ETAService],
})
export class ETAModule {}
