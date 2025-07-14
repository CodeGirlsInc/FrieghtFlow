import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { ScheduleModule } from "@nestjs/schedule"
import { EscrowSettlementService } from "./services/escrow-settlement.service"
import { StarkNetService } from "./services/starknet.service"
import { EscrowSettlementController } from "./controllers/escrow-settlement.controller"
import { EscrowSettlementListener } from "./listeners/escrow-settlement.listener"
import { EscrowTransaction } from "./entities/escrow-transaction.entity"

@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowTransaction]),
    ConfigModule,
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
  ],
  controllers: [EscrowSettlementController],
  providers: [EscrowSettlementService, StarkNetService, EscrowSettlementListener],
  exports: [EscrowSettlementService, StarkNetService],
})
export class EscrowSettlementModule {}
