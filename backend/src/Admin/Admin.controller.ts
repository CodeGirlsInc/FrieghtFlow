import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateAdminDto } from './dtos/create-Admin.dto';
import { AdminService } from './providers/adminService';
import { UpdateAdminDto } from './dtos/update-Admin.dto';


@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(CreateAdminDto);
  }

  @Get()
  findAll() {
    return this.adminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateadminDto: UpdateAdminDto) {
    return this.adminService.update(+id, UpdateAdminDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}
