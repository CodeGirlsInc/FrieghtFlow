import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { EscrowTransaction } from './entities/escrow.entity';
import { StellarPaymentsService } from './stellar-payments.service';
import { StellarPaymentsController } from './stellar-payments.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([EscrowTransaction]), AuditLogModule],
  providers: [StellarPaymentsService],
  controllers: [StellarPaymentsController],
  exports: [StellarPaymentsService],
})
export class StellarPaymentsModule {}