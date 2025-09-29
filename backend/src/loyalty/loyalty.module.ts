import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyAccount } from './entities/loyalty-account.entity';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './services/loyalty.service';
import { StellarService } from './services/stellar.service';
import { LoyaltyEventListener } from './listeners/loyalty.listener';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([LoyaltyAccount]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService, StellarService, LoyaltyEventListener],
})
export class LoyaltyModule {}