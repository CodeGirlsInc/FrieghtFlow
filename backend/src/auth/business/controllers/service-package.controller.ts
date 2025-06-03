import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from "@nestjs/common"
import type { ServicePackageService } from "../services/service-package.service"
import type { CreateServicePackageDto } from "../dto/create-service-package.dto"
import type { UpdateServicePackageDto } from "../dto/update-service-package.dto"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"

@Controller("service-packages")
export class ServicePackageController {
  constructor(private readonly servicePackageService: ServicePackageService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createServicePackageDto: CreateServicePackageDto) {
    return this.servicePackageService.create(createServicePackageDto);
  }

  @Get()
  async findAll(
    @Query('active') active?: boolean,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.servicePackageService.findAll({
      active: active !== undefined ? active : undefined,
      page: +page,
      limit: +limit,
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicePackageService.findOne(id);
  }

  @Put(":id")
  @UseGuards(RolesGuard)
  @Roles("admin")
  async update(@Param('id') id: string, @Body() updateServicePackageDto: UpdateServicePackageDto) {
    return this.servicePackageService.update(id, updateServicePackageDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.servicePackageService.remove(id);
  }

  @Post("businesses/:businessId/select/:packageId")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager", "business")
  async selectPackage(@Param('businessId') businessId: string, @Param('packageId') packageId: string) {
    return this.servicePackageService.selectPackageForBusiness(businessId, packageId)
  }

  @Delete("businesses/:businessId/select/:packageId")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager", "business")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deselectPackage(@Param('businessId') businessId: string, @Param('packageId') packageId: string) {
    await this.servicePackageService.deselectPackageForBusiness(businessId, packageId)
  }
}
