import { Controller, Get, Put, Body, Param, UseGuards } from "@nestjs/common"
import type { BusinessProfileService } from "../services/business-profile.service"
import type { UpdateBusinessProfileDto } from "../dto/update-business-profile.dto"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"

@Controller("businesses/:businessId/profile")
export class BusinessProfileController {
  constructor(private readonly businessProfileService: BusinessProfileService) {}

  @Get(':businessId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'business')
  async findOne(@Param('businessId') businessId: string) {
    return this.businessProfileService.findByBusinessId(businessId);
  }

  @Put(":businessId")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager", "business")
  async update(@Param('businessId') businessId: string, @Body() updateProfileDto: UpdateBusinessProfileDto) {
    return this.businessProfileService.update(businessId, updateProfileDto)
  }
}
