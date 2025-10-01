import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Emission } from './entities/emission.entity';
import { EmissionService } from './emission.service';

@Module({
  imports: [TypeOrmModule.forFeature([Emission])],
  providers: [EmissionService],
  exports: [EmissionService],
})
export class EmissionModule {}