import { Body, Controller, Get, Post, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { LoyaltyService } from './services/loyalty.service';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

// DTO for redemption request validation
export class RedeemPointsDto {
  @IsInt()
  @IsPositive()
  points: number;

  @IsString()
  @IsNotEmpty()
  stellarAddress: string; // The user's public Stellar wallet address
}

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('balance/:userId')
  getBalance(@Param('userId') userId: string) {
    return this.loyaltyService.getPointsBalance(userId);
  }

  @Post('redeem/:userId')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  redeemPoints(@Param('userId') userId: string, @Body() redeemPointsDto: RedeemPointsDto) {
    return this.loyaltyService.redeemPoints(
      userId,
      redeemPointsDto.points,
      redeemPointsDto.stellarAddress,
    );
  }
}