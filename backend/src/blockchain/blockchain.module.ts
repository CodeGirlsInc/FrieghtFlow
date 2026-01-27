
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { BlockchainProcessor } from './blockchain.processor';
import { BlockchainTransaction } from './entities/blockchain.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlockchainTransaction]),
    BullModule.registerQueue({
      name: 'blockchain',
    }),
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService, BlockchainProcessor],
})
export class BlockchainModule {}
