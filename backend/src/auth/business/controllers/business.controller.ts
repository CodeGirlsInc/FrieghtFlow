import { Controller, Get, Post, Put, Delete, Param, Query, UseGuards, HttpStatus, HttpCode, Body } from "@nestjs/common"
import type { BusinessService } from "../services/business.service"
import type { CreateBusinessDto } from "../dto/create-business.dto"
import type { UpdateBusinessDto } from "../dto/update-business.dto"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"

@Controller("businesses")
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBusinessDto: CreateBusinessDto) {
    return this.businessService.create(createBusinessDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('status') status?: string) {
    return this.businessService.findAll({
      page: +page,
      limit: +limit,
      status,
    })
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'business')
  async findOne(@Param('id') id: string) {
    return this.businessService.findOne(id);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager", "business")
  async update(@Param('id') id: string, @Body() updateBusinessDto: UpdateBusinessDto) {
    return this.businessService.update(id, updateBusinessDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.businessService.remove(id);
  }
}
