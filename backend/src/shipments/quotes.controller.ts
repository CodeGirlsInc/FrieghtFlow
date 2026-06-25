import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShipmentsService } from './shipments.service';
import { CargoCategory } from '../common/enums/cargo-category.enum';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

class MarketRateQueryDto {
  @ApiProperty()
  @IsString()
  origin: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @ApiPropertyOptional({ enum: CargoCategory, required: false })
  @IsOptional()
  @IsEnum(CargoCategory)
  cargoCategory?: CargoCategory;
}

class EstimateQuoteDto {
  @ApiProperty()
  @IsString()
  origin: string;

  @ApiProperty()
  @IsString()
  destination: string;

  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg: number;

  @ApiPropertyOptional({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volumeCbm?: number;

  @ApiPropertyOptional({ enum: CargoCategory, required: false })
  @IsOptional()
  @IsEnum(CargoCategory)
  cargoCategory?: CargoCategory;
}

@ApiTags('quotes')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(RolesGuard)
export class QuotesController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get('market-rate')
  @Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Estimate a market rate from completed shipments' })
  @ApiResponse({ status: 200, description: 'Estimated market rate response' })
  getMarketRate(@Query() query: MarketRateQueryDto): Promise<unknown> {
    return this.shipmentsService.getMarketRate(query);
  }

  @Post('estimate')
  @Roles(UserRole.SHIPPER, UserRole.CARRIER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Estimate an instant price for a shipment' })
  estimate(@Body() dto: EstimateQuoteDto) {
    return this.shipmentsService.estimatePrice(dto);
  }
}
