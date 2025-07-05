import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { EventEmitterModule } from "@nestjs/event-emitter"
import { DeliveryProofService } from "./services/delivery-proof.service"
import { DeliveryProofController } from "./controllers/delivery-proof.controller"
import { DeliveryProofListener } from "./listeners/delivery-proof.listener"
import { DeliveryProof } from "./entities/delivery-proof.entity"

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryProof]), EventEmitterModule.forRoot()],
  controllers: [DeliveryProofController],
  providers: [DeliveryProofService, DeliveryProofListener],
  exports: [DeliveryProofService],
})
export class DeliveryProofModule {}
