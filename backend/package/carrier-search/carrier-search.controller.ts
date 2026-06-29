import { Controller, Get, Query } from '@nestjs/common';
import { CarrierSearchService } from './carrier-search.service';
import { CarrierSearchDto } from './dto/carrier-search.dto';

@Controller('api/carriers')
export class CarrierSearchController {
  constructor(private readonly carrierSearchService: CarrierSearchService) {}

  @Get('search')
  search(@Query() query: CarrierSearchDto) {
    return this.carrierSearchService.search(query);
  }
}
