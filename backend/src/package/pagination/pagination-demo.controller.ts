import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { paginate } from './pagination.util';
import { DemoItem } from './entities/demo-item.entity';

@Controller('demo/items')
export class PaginationDemoController {
  constructor(
    @InjectRepository(DemoItem)
    private readonly demoRepo: Repository<DemoItem>,
  ) {}

  @Get()
  list(@Query() query: PaginationDto): Promise<PaginatedResponseDto<DemoItem>> {
    return paginate(this.demoRepo, query);
  }
}
