import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SustainabilityService } from './sustainability.service';
import { SustainabilityController } from './sustainability.controller';
import { Emission } from 'src/emission/entities/emission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Emission])],
  controllers: [SustainabilityController],
  providers: [SustainabilityService],
  exports: [SustainabilityService],
})
export class SustainabilityModule {}
