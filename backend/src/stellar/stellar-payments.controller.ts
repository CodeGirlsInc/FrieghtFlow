import { Controller, Post, Get, Param, Body, Query, Req } from '@nestjs/common';
import { StellarPaymentsService } from './stellar-payments.service';
import { EscrowStatus } from './entities/escrow.entity';
import { IsString, IsNumber, IsOptional, IsUUID, IsEnum, Min, Length } from 'class-validator';
import { Type } from 'class-transformer';

class CreateEscrowDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.000001)
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 12)
  assetCode?: string;

  @IsOptional()
  @IsString()
  @Length(56, 56)
  assetIssuer?: string;

  @IsString()
  @Length(56, 56)
  carrierStellarAddress: string;

  @IsString()
  @Length(56, 56)
  shipperStellarAddress: string;

  @IsOptional()
  @IsUUID()
  shipperUserId?: string;

  @IsOptional()
  @IsUUID()
  carrierPartnerId?: string;
}

@Controller('stellar')
export class StellarPaymentsController {
  constructor(private readonly stellarService: StellarPaymentsService) {}

  @Post('escrows')
  createEscrow(@Body() dto: CreateEscrowDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.stellarService.createEscrow(dto, userId);
  }

  @Get('escrows')
  listEscrows(@Query('status') status?: EscrowStatus) {
    return this.stellarService.listEscrows(status);
  }

  @Get('escrows/:id')
  getEscrow(@Param('id') id: string) {
    return this.stellarService.getEscrow(id);
  }

  @Post('escrows/:id/verify-funding')
  verifyFunding(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.stellarService.verifyFunding(id, userId);
  }

  @Post('escrows/:id/release')
  releaseEscrow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.stellarService.releaseEscrow(id, userId);
  }

  @Post('escrows/:id/refund')
  refundEscrow(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.stellarService.refundEscrow(id, userId);
  }
}