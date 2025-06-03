import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';
import { Location } from './entities/location.entity';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  create(@Body() data: Partial<Location>): Promise<Location> {
    return this.locationService.createLocation(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Location> {
    return this.locationService.getLocation(id);
  }
}
