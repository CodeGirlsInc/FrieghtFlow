import { Controller, Post, Get, Param, Patch, Body, Query, Req } from '@nestjs/common';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { FilterDisputeDto } from './dto/filter-dispute.dto';
import { UpdateDisputeStatusDto } from './dto/update-dispute-status.dto';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  create(@Body() dto: CreateDisputeDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.disputesService.create(dto, userId);
  }

  @Get()
  findAll(@Query() filter: FilterDisputeDto) {
    return this.disputesService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.disputesService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDisputeStatusDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.disputesService.updateStatus(id, dto, userId);
  }
}