import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RewardsEngineController } from "./controllers/rewards-engine.controller"
import { RewardsEngineService } from "./services/rewards-engine.service"
import { PointsCalculationService } from "./services/points-calculation.service"
import { TierManagementService } from "./services/tier-management.service"
import { RedemptionService } from "./services/redemption.service"
import { UserReward } from "./entities/user-reward.entity"
import { RewardTransaction } from "./entities/reward-transaction.entity"
import { TierConfiguration } from "./entities/tier-configuration.entity"
import { Redemption } from "./entities/redemption.entity"

@Module({
  imports: [TypeOrmModule.forFeature([UserReward, RewardTransaction, TierConfiguration, Redemption])],
  controllers: [RewardsEngineController],
  providers: [RewardsEngineService, PointsCalculationService, TierManagementService, RedemptionService],
  exports: [RewardsEngineService, RedemptionService],
})
export class RewardsEngineModule {}
