import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
} from "@nestjs/common"
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger"
import type { PricingService } from "../services/pricing.service"
import { CreatePricingConfigDto, UpdatePricingConfigDto, PricingConfigResponseDto } from "../dto/pricing-config.dto"

@ApiTags("Pricing Configuration")
@Controller("pricing-configs")
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  @ApiOperation({ summary: "Get all active pricing configurations" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Pricing configurations retrieved successfully",
    type: [PricingConfigResponseDto],
  })
  async getAllPricingConfigs() {
    return this.pricingService.getAllPricingConfigs()
  }

  @Post()
  @ApiOperation({ summary: "Create a new pricing configuration" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Pricing configuration created successfully",
    type: PricingConfigResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid input data",
  })
  @ApiBody({ type: CreatePricingConfigDto })
  async createPricingConfig(createPricingConfigDto: CreatePricingConfigDto) {
    return this.pricingService.createPricingConfig(createPricingConfigDto)
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a pricing configuration" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Pricing configuration updated successfully",
    type: PricingConfigResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Pricing configuration not found",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Invalid update data",
  })
  @ApiParam({ name: "id", description: "Pricing configuration ID" })
  @ApiBody({ type: UpdatePricingConfigDto })
  async updatePricingConfig(@Param("id", ParseUUIDPipe) id: string, updatePricingConfigDto: UpdatePricingConfigDto) {
    return this.pricingService.updatePricingConfig(id, updatePricingConfigDto)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Deactivate a pricing configuration" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Pricing configuration deactivated successfully",
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Pricing configuration not found",
  })
  @ApiParam({ name: "id", description: "Pricing configuration ID" })
  async deactivatePricingConfig(@Param("id", ParseUUIDPipe) id: string) {
    await this.pricingService.deactivatePricingConfig(id)
    return { message: "Pricing configuration deactivated successfully" }
  }
}
