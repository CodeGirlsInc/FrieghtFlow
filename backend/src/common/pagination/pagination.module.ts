import { Module } from '@nestjs/common';
import { PaginationProvider } from './pagination.provider';

@Module({
  imports: [],
  controllers: [],
  providers: [PaginationProvider],
  exports: [PaginationProvider],
})
export class PaginationModule {}
