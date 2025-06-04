import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Transaction } from "../entities/transaction.entity"
import type { TransactionReportDto } from "../dto/transaction-report.dto"

@Injectable()
export class TransactionReportService {
  private readonly logger = new Logger(TransactionReportService.name)

  constructor(private transactionRepository: Repository<Transaction>) {}

  async generateSummaryReport(reportDto: TransactionReportDto): Promise<any> {
    try {
      const { startDate, endDate, status, gateway, currency } = reportDto

      const queryBuilder = this.transactionRepository
        .createQueryBuilder("transaction")
        .where("transaction.createdAt BETWEEN :startDate AND :endDate", {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })

      if (status && status.length > 0) {
        queryBuilder.andWhere("transaction.status IN (:...status)", { status })
      }

      if (gateway && gateway.length > 0) {
        queryBuilder.andWhere("transaction.gateway IN (:...gateway)", { gateway })
      }

      if (currency) {
        queryBuilder.andWhere("transaction.currency = :currency", { currency })
      }

      // Get total count and sum
      const totalCount = await queryBuilder.getCount()

      // Clone the query builder for sum
      const sumQueryBuilder = queryBuilder.clone()
      const sumResult = await sumQueryBuilder
        .select("SUM(transaction.amount)", "totalAmount")
        .addSelect("transaction.currency", "currency")
        .groupBy("transaction.currency")
        .getRawMany()

      // Get success rate
      const successQueryBuilder = queryBuilder.clone()
      const successCount = await successQueryBuilder.andWhere("transaction.status = 'completed'").getCount()

      const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0

      // Get average amount
      const avgQueryBuilder = queryBuilder.clone()
      const avgResult = await avgQueryBuilder
        .select("AVG(transaction.amount)", "avgAmount")
        .addSelect("transaction.currency", "currency")
        .groupBy("transaction.currency")
        .getRawMany()

      // Format the results
      const summaryByCurrency = {}

      for (const sum of sumResult) {
        const currencyCode = sum.currency
        const avg = avgResult.find((a) => a.currency === currencyCode)

        summaryByCurrency[currencyCode] = {
          totalTransactions: totalCount,
          totalAmount: Number(sum.totalAmount),
          successRate: successRate,
          averageAmount: avg ? Number(avg.avgAmount) : 0,
        }
      }

      return {
        period: `${new Date(startDate).toISOString()} to ${new Date(endDate).toISOString()}`,
        summary: summaryByCurrency,
      }
    } catch (error) {
      this.logger.error(`Error generating summary report: ${error.message}`, error.stack)
      throw error
    }
  }

  async generateVolumeReport(reportDto: TransactionReportDto): Promise<any> {
    try {
      const { startDate, endDate, status, gateway, currency, groupBy } = reportDto

      const queryBuilder = this.transactionRepository
        .createQueryBuilder("transaction")
        .where("transaction.createdAt BETWEEN :startDate AND :endDate", {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })

      if (status && status.length > 0) {
        queryBuilder.andWhere("transaction.status IN (:...status)", { status })
      }

      if (gateway && gateway.length > 0) {
        queryBuilder.andWhere("transaction.gateway IN (:...gateway)", { gateway })
      }

      if (currency) {
        queryBuilder.andWhere("transaction.currency = :currency", { currency })
      }

      // Group by time period
      let timeFormat: string
      switch (groupBy) {
        case "day":
          timeFormat = "YYYY-MM-DD"
          break
        case "week":
          timeFormat = 'YYYY-"W"IW'
          break
        case "month":
          timeFormat = "YYYY-MM"
          break
        default:
          timeFormat = "YYYY-MM-DD"
      }

      const volumeData = await queryBuilder
        .select(`TO_CHAR(transaction.createdAt, '${timeFormat}')`, "period")
        .addSelect("COUNT(transaction.id)", "count")
        .addSelect("SUM(transaction.amount)", "amount")
        .addSelect("transaction.currency", "currency")
        .groupBy("period")
        .addGroupBy("transaction.currency")
        .orderBy("period", "ASC")
        .getRawMany()

      return {
        period: `${new Date(startDate).toISOString()} to ${new Date(endDate).toISOString()}`,
        groupBy,
        data: volumeData.map((item) => ({
          period: item.period,
          count: Number(item.count),
          amount: Number(item.amount),
          currency: item.currency,
        })),
      }
    } catch (error) {
      this.logger.error(`Error generating volume report: ${error.message}`, error.stack)
      throw error
    }
  }

  async generateStatusBreakdownReport(reportDto: TransactionReportDto): Promise<any> {
    try {
      const { startDate, endDate, gateway, currency } = reportDto

      const queryBuilder = this.transactionRepository
        .createQueryBuilder("transaction")
        .where("transaction.createdAt BETWEEN :startDate AND :endDate", {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })

      if (gateway && gateway.length > 0) {
        queryBuilder.andWhere("transaction.gateway IN (:...gateway)", { gateway })
      }

      if (currency) {
        queryBuilder.andWhere("transaction.currency = :currency", { currency })
      }

      const statusData = await queryBuilder
        .select("transaction.status", "status")
        .addSelect("COUNT(transaction.id)", "count")
        .addSelect("SUM(transaction.amount)", "amount")
        .addSelect("transaction.currency", "currency")
        .groupBy("transaction.status")
        .addGroupBy("transaction.currency")
        .orderBy("count", "DESC")
        .getRawMany()

      // Get total count for percentage calculation
      const totalQueryBuilder = queryBuilder.clone()
      const totalCount = await totalQueryBuilder.getCount()

      return {
        period: `${new Date(startDate).toISOString()} to ${new Date(endDate).toISOString()}`,
        totalTransactions: totalCount,
        breakdown: statusData.map((item) => ({
          status: item.status,
          count: Number(item.count),
          amount: Number(item.amount),
          currency: item.currency,
          percentage: totalCount > 0 ? (Number(item.count) / totalCount) * 100 : 0,
        })),
      }
    } catch (error) {
      this.logger.error(`Error generating status breakdown report: ${error.message}`, error.stack)
      throw error
    }
  }

  async generateGatewayBreakdownReport(reportDto: TransactionReportDto): Promise<any> {
    try {
      const { startDate, endDate, status, currency } = reportDto

      const queryBuilder = this.transactionRepository
        .createQueryBuilder("transaction")
        .where("transaction.createdAt BETWEEN :startDate AND :endDate", {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })

      if (status && status.length > 0) {
        queryBuilder.andWhere("transaction.status IN (:...status)", { status })
      }

      if (currency) {
        queryBuilder.andWhere("transaction.currency = :currency", { currency })
      }

      const gatewayData = await queryBuilder
        .select("transaction.gateway", "gateway")
        .addSelect("COUNT(transaction.id)", "count")
        .addSelect("SUM(transaction.amount)", "amount")
        .addSelect("transaction.currency", "currency")
        .groupBy("transaction.gateway")
        .addGroupBy("transaction.currency")
        .orderBy("count", "DESC")
        .getRawMany()

      // Get total count for percentage calculation
      const totalQueryBuilder = queryBuilder.clone()
      const totalCount = await totalQueryBuilder.getCount()

      return {
        period: `${new Date(startDate).toISOString()} to ${new Date(endDate).toISOString()}`,
        totalTransactions: totalCount,
        breakdown: gatewayData.map((item) => ({
          gateway: item.gateway,
          count: Number(item.count),
          amount: Number(item.amount),
          currency: item.currency,
          percentage: totalCount > 0 ? (Number(item.count) / totalCount) * 100 : 0,
        })),
      }
    } catch (error) {
      this.logger.error(`Error generating gateway breakdown report: ${error.message}`, error.stack)
      throw error
    }
  }

  async generateTimeSeriesReport(reportDto: TransactionReportDto): Promise<any> {
    try {
      const { startDate, endDate, status, gateway, currency, groupBy } = reportDto

      const queryBuilder = this.transactionRepository
        .createQueryBuilder("transaction")
        .where("transaction.createdAt BETWEEN :startDate AND :endDate", {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        })

      if (status && status.length > 0) {
        queryBuilder.andWhere("transaction.status IN (:...status)", { status })
      }

      if (gateway && gateway.length > 0) {
        queryBuilder.andWhere("transaction.gateway IN (:...gateway)", { gateway })
      }

      if (currency) {
        queryBuilder.andWhere("transaction.currency = :currency", { currency })
      }

      // Group by time period
      let timeFormat: string
      switch (groupBy) {
        case "day":
          timeFormat = "YYYY-MM-DD"
          break
        case "week":
          timeFormat = 'YYYY-"W"IW'
          break
        case "month":
          timeFormat = "YYYY-MM"
          break
        default:
          timeFormat = "YYYY-MM-DD"
      }

      const timeSeriesData = await queryBuilder
        .select(`TO_CHAR(transaction.createdAt, '${timeFormat}')`, "period")
        .addSelect("transaction.status", "status")
        .addSelect("COUNT(transaction.id)", "count")
        .addSelect("SUM(transaction.amount)", "amount")
        .addSelect("transaction.currency", "currency")
        .groupBy("period")
        .addGroupBy("transaction.status")
        .addGroupBy("transaction.currency")
        .orderBy("period", "ASC")
        .getRawMany()

      // Organize data by period
      const organizedData = {}

      timeSeriesData.forEach((item) => {
        if (!organizedData[item.period]) {
          organizedData[item.period] = {
            period: item.period,
            total: 0,
            amount: 0,
            currency: item.currency,
            byStatus: {},
          }
        }

        organizedData[item.period].total += Number(item.count)
        organizedData[item.period].amount += Number(item.amount)
        organizedData[item.period].byStatus[item.status] = {
          count: Number(item.count),
          amount: Number(item.amount),
        }
      })

      return {
        period: `${new Date(startDate).toISOString()} to ${new Date(endDate).toISOString()}`,
        groupBy,
        data: Object.values(organizedData),
      }
    } catch (error) {
      this.logger.error(`Error generating time series report: ${error.message}`, error.stack)
      throw error
    }
  }
}
