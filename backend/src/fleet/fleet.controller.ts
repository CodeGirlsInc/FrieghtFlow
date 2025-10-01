import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { CreateFleetDto } from './dto/create-carrier.dto';
import { UpdateFleetDto } from './dto/update-fleet.dto';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Post()
  create(@Body() createFleetDto: CreateFleetDto) {
    return this.fleetService.create(createFleetDto);
  }

  @Get()
  findAll() {
    return this.fleetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fleetService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFleetDto: UpdateFleetDto) {
    return this.fleetService.update(+id, updateFleetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fleetService.remove(+id);
  }
}
