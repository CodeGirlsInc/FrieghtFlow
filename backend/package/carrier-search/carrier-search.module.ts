import { Module } from '@nestjs/common';
import { CarrierSearchController } from './carrier-search.controller';
import { CarrierSearchService } from './carrier-search.service';

@Module({
  controllers: [CarrierSearchController],
  providers: [CarrierSearchService],
  exports: [CarrierSearchService],
})
export class CarrierSearchModule {}
