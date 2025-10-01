import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmissionService } from './emission.service';
import { CreateEmissionDto } from './dto/create-emission.dto';
import { UpdateEmissionDto } from './dto/update-emission.dto';

@Controller('emission')
export class EmissionController {
  constructor(private readonly emissionService: EmissionService) {}

  @Post()
  create(@Body() createEmissionDto: CreateEmissionDto) {
    return this.emissionService.create(createEmissionDto);
  }

  @Get()
  findAll() {
    return this.emissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.emissionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEmissionDto: UpdateEmissionDto) {
    return this.emissionService.update(+id, updateEmissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.emissionService.remove(+id);
  }
}
