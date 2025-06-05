import { Injectable } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import { Networks } from "@stellar/stellar-sdk"

@Injectable()
export class StellarConfigService {
  constructor(private configService: ConfigService) {}

  get horizonUrl(): string {
    return this.configService.get<string>("STELLAR_HORIZON_URL", "https://horizon-testnet.stellar.org")
  }

  get networkPassphrase(): string {
    const isTestnet = this.configService.get<boolean>("STELLAR_TESTNET", true)
    return isTestnet ? Networks.TESTNET : Networks.PUBLIC
  }

  get isTestnet(): boolean {
    return this.configService.get<boolean>("STELLAR_TESTNET", true)
  }

  get friendbotUrl(): string {
    return this.configService.get<string>("STELLAR_FRIENDBOT_URL", "https://friendbot.stellar.org")
  }

  get baseFee(): string {
    return this.configService.get<string>("STELLAR_BASE_FEE", "100")
  }

  get timeout(): number {
    return this.configService.get<number>("STELLAR_TIMEOUT", 30)
  }
}
