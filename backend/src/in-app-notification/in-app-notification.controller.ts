import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InAppNotificationService } from './in-app-notification.service';
import { CreateInAppNotificationDto } from './dto/create-in-app-notification.dto';
import { UpdateInAppNotificationDto } from './dto/update-in-app-notification.dto';

@Controller('in-app-notification')
export class InAppNotificationController {
  constructor(private readonly inAppNotificationService: InAppNotificationService) {}

  @Post()
  create(@Body() createInAppNotificationDto: CreateInAppNotificationDto) {
    return this.inAppNotificationService.create(createInAppNotificationDto);
  }

  @Get()
  findAll() {
    return this.inAppNotificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inAppNotificationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInAppNotificationDto: UpdateInAppNotificationDto) {
    return this.inAppNotificationService.update(+id, updateInAppNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inAppNotificationService.remove(+id);
  }
}
