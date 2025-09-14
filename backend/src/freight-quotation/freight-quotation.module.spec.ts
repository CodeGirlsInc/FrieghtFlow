import { Test } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { FreightQuotationModule } from "./freight-quotation.module"
import { FreightQuotationController } from "./controllers/freight-quotation.controller"
import { PricingController } from "./controllers/pricing.controller"
import { FreightQuotationService } from "./services/freight-quotation.service"
import { PricingService } from "./services/pricing.service"
import { FreightQuote } from "./entities/freight-quote.entity"
import { PricingConfig } from "./entities/pricing-config.entity"

describe("FreightQuotationModule", () => {
  let module: any

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      imports: [FreightQuotationModule],
    })
      .overrideProvider(getRepositoryToken(FreightQuote))
      .useValue({})
      .overrideProvider(getRepositoryToken(PricingConfig))
      .useValue({})
      .compile()

    module = testModule
  })

  it("should be defined", () => {
    expect(module).toBeDefined()
  })

  it("should have FreightQuotationController", () => {
    const controller = module.get<FreightQuotationController>(FreightQuotationController)
    expect(controller).toBeDefined()
  })

  it("should have PricingController", () => {
    const controller = module.get<PricingController>(PricingController)
    expect(controller).toBeDefined()
  })

  it("should have FreightQuotationService", () => {
    const service = module.get<FreightQuotationService>(FreightQuotationService)
    expect(service).toBeDefined()
  })

  it("should have PricingService", () => {
    const service = module.get<PricingService>(PricingService)
    expect(service).toBeDefined()
  })
})
