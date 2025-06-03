import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpStatus, HttpCode } from "@nestjs/common"
import type { VerificationService } from "../services/verification.service"
import type { CreateVerificationDto } from "../dto/create-verification.dto"
import type { UpdateVerificationDto } from "../dto/update-verification.dto"
import { RolesGuard } from "../../common/guards/roles.guard"
import { Roles } from "../../common/decorators/roles.decorator"

@Controller("businesses/:businessId/verification")
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles("business", "admin")
  @HttpCode(HttpStatus.CREATED)
  async create(@Param('businessId') businessId: string, @Body() createVerificationDto: CreateVerificationDto) {
    return this.verificationService.create(businessId, createVerificationDto)
  }

  @Get(':businessId')
  @UseGuards(RolesGuard)
  @Roles('business', 'admin', 'manager')
  async findOne(@Param('businessId') businessId: string) {
    return this.verificationService.findByBusinessId(businessId);
  }

  @Put(":businessId")
  @UseGuards(RolesGuard)
  @Roles("admin", "manager")
  async update(@Param('businessId') businessId: string, @Body() updateVerificationDto: UpdateVerificationDto) {
    return this.verificationService.update(businessId, updateVerificationDto)
  }
}
