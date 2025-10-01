import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { SustainabilityService } from './sustainability.service';

@Controller('sustainability')
export class SustainabilityController {
  constructor(private readonly sustainabilityService: SustainabilityService) {}

  @Get('summary/:userId')
  getUserSummary(@Param('userId') userId: string) {
    return this.sustainabilityService.getUserSummary(userId);
  }
}
