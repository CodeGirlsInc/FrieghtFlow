import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowTransaction } from './entities/escrow-transaction.entity';
import { StellarEscrowBridgeService } from './stellar-escrow.service';

@Module({
  imports: [TypeOrmModule.forFeature([EscrowTransaction])],
  providers: [StellarEscrowBridgeService],
  exports: [StellarEscrowBridgeService],
})
export class StellarEscrowModule {}
