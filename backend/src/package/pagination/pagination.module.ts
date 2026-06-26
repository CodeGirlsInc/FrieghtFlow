import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoItem } from './entities/demo-item.entity';
import { PaginationDemoController } from './pagination-demo.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DemoItem])],
  controllers: [PaginationDemoController],
  exports: [],
})
export class PaginationModule {}
