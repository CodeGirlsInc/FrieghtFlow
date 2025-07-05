import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HttpModule } from "@nestjs/axios"
import { ScheduleModule } from "@nestjs/schedule"

// Entities
import { BlockchainEvent } from "./entities/blockchain-event.entity"
import { ContractSubscription } from "./entities/contract-subscription.entity"
import { EventProcessingCheckpoint } from "./entities/event-processing-checkpoint.entity"

// Services
import { StarkNetClientService } from "./services/starknet-client.service"
import { EventProcessorService } from "./services/event-processor.service"
import { EventSubscriptionService } from "./services/event-subscription.service"

// Controllers
import { EventSubscriptionsController } from "./controllers/event-subscriptions.controller"
import { BlockchainEventsController } from "./controllers/blockchain-events.controller"

@Module({
  imports: [
    TypeOrmModule.forFeature([BlockchainEvent, ContractSubscription, EventProcessingCheckpoint]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [EventSubscriptionsController, BlockchainEventsController],
  providers: [StarkNetClientService, EventProcessorService, EventSubscriptionService],
  exports: [StarkNetClientService, EventProcessorService, EventSubscriptionService],
})
export class BlockchainEventLoggerModule {}
