import { Injectable, Logger } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type QRCode, QRCodeType, QRCodeStatus } from "../entities/qr-code.entity"
import { type QRScanLog, ScanResult } from "../entities/qr-scan-log.entity"
import type { QRCodeStatistics } from "../interfaces/qr-generator.interface"

@Injectable()
export class QRAnalyticsService {
  private readonly logger = new Logger(QRAnalyticsService.name)

  constructor(
    private qrCodeRepository: Repository<QRCode>,
    private scanLogRepository: Repository<QRScanLog>,
  ) {}

  async getOverallStatistics(): Promise<QRCodeStatistics> {
    const [
      totalGenerated,
      totalScanned,
      activeCount,
      expiredCount,
      usedCount,
      revokedCount,
      scansByType,
      scansByResult,
    ] = await Promise.all([
      this.qrCodeRepository.count(),
      this.scanLogRepository.count(),
      this.qrCodeRepository.count({ where: { status: QRCodeStatus.ACTIVE } }),
      this.qrCodeRepository.count({ where: { status: QRCodeStatus.EXPIRED } }),
      this.qrCodeRepository.count({ where: { status: QRCodeStatus.USED } }),
      this.qrCodeRepository.count({ where: { status: QRCodeStatus.REVOKED } }),
      this.getScansByType(),
      this.getScansByResult(),
    ])

    return {
      totalGenerated,
      totalScanned,
      activeCount,
      expiredCount,
      usedCount,
      revokedCount,
      scansByType,
      scansByResult,
    }
  }

  async getQRCodeUsageReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    period: { start: Date; end: Date }
    generated: number
    scanned: number
    successfulScans: number
    failedScans: number
    topTypes: Array<{ type: QRCodeType; count: number }>
    dailyActivity: Array<{ date: string; generated: number; scanned: number }>
  }> {
    const [generated, scanned, successfulScans, failedScans, topTypes, dailyActivity] = await Promise.all([
      this.qrCodeRepository.count({
        where: {
          createdAt: { $gte: startDate, $lte: endDate } as any,
        },
      }),
      this.scanLogRepository.count({
        where: {
          createdAt: { $gte: startDate, $lte: endDate } as any,
        },
      }),
      this.scanLogRepository.count({
        where: {
          createdAt: { $gte: startDate, $lte: endDate } as any,
          scanResult: ScanResult.SUCCESS,
        },
      }),
      this.scanLogRepository.count({
        where: {
          createdAt: { $gte: startDate, $lte: endDate } as any,
          scanResult: { $ne: ScanResult.SUCCESS } as any,
        },
      }),
      this.getTopQRCodeTypes(startDate, endDate),
      this.getDailyActivity(startDate, endDate),
    ])

    return {
      period: { start: startDate, end: endDate },
      generated,
      scanned,
      successfulScans,
      failedScans,
      topTypes,
      dailyActivity,
    }
  }

  async getQRCodePerformanceMetrics(): Promise<{
    averageScansPerCode: number
    mostScannedType: QRCodeType
    peakScanHour: number
    scanSuccessRate: number
    averageTimeToFirstScan: number // in minutes
  }> {
    const [avgScans, mostScannedType, peakHour, successRate, avgTimeToScan] = await Promise.all([
      this.getAverageScansPerCode(),
      this.getMostScannedType(),
      this.getPeakScanHour(),
      this.getScanSuccessRate(),
      this.getAverageTimeToFirstScan(),
    ])

    return {
      averageScansPerCode: avgScans,
      mostScannedType,
      peakScanHour: peakHour,
      scanSuccessRate: successRate,
      averageTimeToFirstScan: avgTimeToScan,
    }
  }

  async getExpirationAnalysis(): Promise<{
    expiringSoon: number // expires within 24 hours
    expiredUnused: number
    averageLifespan: number // in hours
    expirationPatterns: Array<{ hours: number; count: number }>
  }> {
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const [expiringSoon, expiredUnused, averageLifespan, expirationPatterns] = await Promise.all([
      this.qrCodeRepository.count({
        where: {
          status: QRCodeStatus.ACTIVE,
          expiresAt: { $lte: tomorrow, $gte: now } as any,
        },
      }),
      this.qrCodeRepository.count({
        where: {
          status: QRCodeStatus.EXPIRED,
          scanCount: 0,
        },
      }),
      this.getAverageLifespan(),
      this.getExpirationPatterns(),
    ])

    return {
      expiringSoon,
      expiredUnused,
      averageLifespan,
      expirationPatterns,
    }
  }

  async getScanLocationAnalysis(): Promise<Array<{ location: string; count: number }>> {
    const result = await this.scanLogRepository
      .createQueryBuilder("log")
      .select("log.scannedLocation", "location")
      .addSelect("COUNT(*)", "count")
      .where("log.scannedLocation IS NOT NULL")
      .groupBy("log.scannedLocation")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany()

    return result.map((row) => ({
      location: row.location,
      count: Number.parseInt(row.count),
    }))
  }

  async getScannerAnalysis(): Promise<Array<{ scanner: string; count: number; successRate: number }>> {
    const result = await this.scanLogRepository
      .createQueryBuilder("log")
      .select("log.scannedBy", "scanner")
      .addSelect("COUNT(*)", "totalScans")
      .addSelect("SUM(CASE WHEN log.scanResult = 'SUCCESS' THEN 1 ELSE 0 END)", "successfulScans")
      .where("log.scannedBy IS NOT NULL")
      .groupBy("log.scannedBy")
      .orderBy("totalScans", "DESC")
      .limit(10)
      .getRawMany()

    return result.map((row) => ({
      scanner: row.scanner,
      count: Number.parseInt(row.totalScans),
      successRate: Number.parseFloat(row.successfulScans) / Number.parseInt(row.totalScans),
    }))
  }

  private async getScansByType(): Promise<Record<QRCodeType, number>> {
    const result = await this.qrCodeRepository
      .createQueryBuilder("qr")
      .select("qr.type", "type")
      .addSelect("SUM(qr.scanCount)", "totalScans")
      .groupBy("qr.type")
      .getRawMany()

    const scansByType = {} as Record<QRCodeType, number>

    // Initialize all types with 0
    Object.values(QRCodeType).forEach((type) => {
      scansByType[type] = 0
    })

    // Fill with actual data
    result.forEach((row) => {
      scansByType[row.type] = Number.parseInt(row.totalScans) || 0
    })

    return scansByType
  }

  private async getScansByResult(): Promise<Record<ScanResult, number>> {
    const result = await this.scanLogRepository
      .createQueryBuilder("log")
      .select("log.scanResult", "result")
      .addSelect("COUNT(*)", "count")
      .groupBy("log.scanResult")
      .getRawMany()

    const scansByResult = {} as Record<ScanResult, number>

    // Initialize all results with 0
    Object.values(ScanResult).forEach((result) => {
      scansByResult[result] = 0
    })

    // Fill with actual data
    result.forEach((row) => {
      scansByResult[row.result] = Number.parseInt(row.count)
    })

    return scansByResult
  }

  private async getAverageScansPerCode(): Promise<number> {
    const result = await this.qrCodeRepository
      .createQueryBuilder("qr")
      .select("AVG(qr.scanCount)", "avgScans")
      .getRawOne()

    return Number.parseFloat(result?.avgScans) || 0
  }

  private async getMostScannedType(): Promise<QRCodeType> {
    const result = await this.qrCodeRepository
      .createQueryBuilder("qr")
      .select("qr.type", "type")
      .addSelect("SUM(qr.scanCount)", "totalScans")
      .groupBy("qr.type")
      .orderBy("totalScans", "DESC")
      .limit(1)
      .getRawOne()

    return result?.type || QRCodeType.GENERAL
  }

  private async getPeakScanHour(): Promise<number> {
    const result = await this.scanLogRepository
      .createQueryBuilder("log")
      .select("EXTRACT(HOUR FROM log.createdAt)", "hour")
      .addSelect("COUNT(*)", "count")
      .groupBy("hour")
      .orderBy("count", "DESC")
      .limit(1)
      .getRawOne()

    return Number.parseInt(result?.hour) || 12
  }

  private async getScanSuccessRate(): Promise<number> {
    const [total, successful] = await Promise.all([
      this.scanLogRepository.count(),
      this.scanLogRepository.count({ where: { scanResult: ScanResult.SUCCESS } }),
    ])

    return total > 0 ? successful / total : 0
  }

  private async getAverageTimeToFirstScan(): Promise<number> {
    const result = await this.qrCodeRepository
      .createQueryBuilder("qr")
      .select("AVG(EXTRACT(EPOCH FROM (qr.scannedAt - qr.createdAt)) / 60)", "avgMinutes")
      .where("qr.scannedAt IS NOT NULL")
      .getRawOne()

    return Number.parseFloat(result?.avgMinutes) || 0
  }

  private async getAverageLifespan(): Promise<number> {
    const result = await this.qrCodeRepository
      .createQueryBuilder("qr")
      .select("AVG(EXTRACT(EPOCH FROM (qr.expiresAt - qr.createdAt)) / 3600)", "avgHours")
      .getRawOne()

    return Number.parseFloat(result?.avgHours) || 0
  }

  private async getExpirationPatterns(): Promise<Array<{ hours: number; count: number }>> {
    const result = await this.qrCodeRepository
      .createQueryBuilder("qr")
      .select("EXTRACT(EPOCH FROM (qr.expiresAt - qr.createdAt)) / 3600", "hours")
      .addSelect("COUNT(*)", "count")
      .groupBy("hours")
      .orderBy("count", "DESC")
      .limit(10)
      .getRawMany()

    return result.map((row) => ({
      hours: Math.round(Number.parseFloat(row.hours)),
      count: Number.parseInt(row.count),
    }))
  }

  private async getTopQRCodeTypes(startDate: Date, endDate: Date): Promise<Array<{ type: QRCodeType; count: number }>> {
    const result = await this.qrCodeRepository
      .createQueryBuilder("qr")
      .select("qr.type", "type")
      .addSelect("COUNT(*)", "count")
      .where("qr.createdAt >= :startDate", { startDate })
      .andWhere("qr.createdAt <= :endDate", { endDate })
      .groupBy("qr.type")
      .orderBy("count", "DESC")
      .getRawMany()

    return result.map((row) => ({
      type: row.type,
      count: Number.parseInt(row.count),
    }))
  }

  private async getDailyActivity(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{ date: string; generated: number; scanned: number }>> {
    const [generatedData, scannedData] = await Promise.all([
      this.qrCodeRepository
        .createQueryBuilder("qr")
        .select("DATE(qr.createdAt)", "date")
        .addSelect("COUNT(*)", "count")
        .where("qr.createdAt >= :startDate", { startDate })
        .andWhere("qr.createdAt <= :endDate", { endDate })
        .groupBy("date")
        .orderBy("date")
        .getRawMany(),
      this.scanLogRepository
        .createQueryBuilder("log")
        .select("DATE(log.createdAt)", "date")
        .addSelect("COUNT(*)", "count")
        .where("log.createdAt >= :startDate", { startDate })
        .andWhere("log.createdAt <= :endDate", { endDate })
        .groupBy("date")
        .orderBy("date")
        .getRawMany(),
    ])

    // Merge the data
    const activityMap = new Map<string, { generated: number; scanned: number }>()

    generatedData.forEach((row) => {
      activityMap.set(row.date, { generated: Number.parseInt(row.count), scanned: 0 })
    })

    scannedData.forEach((row) => {
      const existing = activityMap.get(row.date) || { generated: 0, scanned: 0 }
      existing.scanned = Number.parseInt(row.count)
      activityMap.set(row.date, existing)
    })

    return Array.from(activityMap.entries()).map(([date, data]) => ({
      date,
      generated: data.generated,
      scanned: data.scanned,
    }))
  }
}
