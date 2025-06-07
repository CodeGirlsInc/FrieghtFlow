import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { AnalyticsController } from "./analytics.controller"
import { AnalyticsService } from "./analytics.service"
import { MixpanelService } from "./services/mixpanel.service"
import { ShipmentAnalyticsService } from "./services/shipment-analytics.service"
import { UserAnalyticsService } from "./services/user-analytics.service"
import { CarrierAnalyticsService } from "./services/carrier-analytics.service"
import { AnalyticsEvent } from "./entities/analytics-event.entity"
import { Shipment } from "../shipment/entities/shipment.entity"
import { User } from "../user/entities/user.entity"
import { Carrier } from "../carrier/entities/carrier.entity"

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([AnalyticsEvent, Shipment, User, Carrier])],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    MixpanelService,
    ShipmentAnalyticsService,
    UserAnalyticsService,
    CarrierAnalyticsService,
  ],
  exports: [AnalyticsService, MixpanelService],
})
export class AnalyticsModule {}
