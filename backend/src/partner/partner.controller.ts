import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { FilterPartnerDto } from './dto/filter-partner.dto';
import { CreatePartnerDto } from './Dto/create-partner.dto';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post()
  create(@Body() dto: CreatePartnerDto) {
    return this.partnerService.create(dto);
  }

  @Get()
  findAll(@Query() filter: FilterPartnerDto) {
    return this.partnerService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnerService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
    return this.partnerService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnerService.remove(id);
  }
}
