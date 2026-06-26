import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MarketplaceSearchService } from './marketplace-search.service';
import { SearchMarketplaceDto } from './dto/search-marketplace.dto';

@ApiTags('marketplace')
@ApiBearerAuth()
@Controller('marketplace')
export class MarketplaceSearchController {
  constructor(private readonly service: MarketplaceSearchService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search available shipments with filters and pagination' })
  search(@Query() query: SearchMarketplaceDto) {
    return this.service.search(query);
  }
}
