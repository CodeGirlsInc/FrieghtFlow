import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"

import { TransactionController } from "./controllers/transaction.controller"
import { TransactionReportController } from "./controllers/transaction-report.controller"

import { TransactionService } from "./services/transaction.service"
import { TransactionSearchService } from "./services/transaction-search.service"
import { TransactionReportService } from "./services/transaction-report.service"

import { Transaction } from "./entities/transaction.entity"
import { TransactionHistory } from "./entities/transaction-history.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionHistory]), ConfigModule],
  controllers: [TransactionController, TransactionReportController],
  providers: [TransactionService, TransactionSearchService, TransactionReportService],
  exports: [TransactionService],
})
export class TransactionModule {}
