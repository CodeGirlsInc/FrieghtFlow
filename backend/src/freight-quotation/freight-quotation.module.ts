import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { FreightQuotationController } from "./controllers/freight-quotation.controller"
import { PricingController } from "./controllers/pricing.controller"
import { FreightQuotationService } from "./services/freight-quotation.service"
import { PricingService } from "./services/pricing.service"
import { FreightQuote } from "./entities/freight-quote.entity"
import { PricingConfig } from "./entities/pricing-config.entity"

@Module({
  imports: [TypeOrmModule.forFeature([FreightQuote, PricingConfig])],
  controllers: [FreightQuotationController, PricingController],
  providers: [FreightQuotationService, PricingService],
  exports: [FreightQuotationService, PricingService],
})
export class FreightQuotationModule {}
