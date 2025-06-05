import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { StellarController } from "./stellar.controller"
import { StellarService } from "./stellar.service"
import { StellarConfigService } from "./config/stellar-config.service"
import { StellarAccount } from "./entities/stellar-account.entity"
import { StellarTransaction } from "./entities/stellar-transaction.entity"
import { EscrowContract } from "./entities/escrow-contract.entity"
import { StellarAccountRepository } from "./repositories/stellar-account.repository"
import { StellarTransactionRepository } from "./repositories/stellar-transaction.repository"
import { EscrowContractRepository } from "./repositories/escrow-contract.repository"

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([StellarAccount, StellarTransaction, EscrowContract])],
  controllers: [StellarController],
  providers: [
    StellarService,
    StellarConfigService,
    StellarAccountRepository,
    StellarTransactionRepository,
    EscrowContractRepository,
  ],
  exports: [StellarService, StellarConfigService],
})
export class StellarModule {}
