import type { QRCodeType } from "../entities/qr-code.entity"
import type { ScanResult } from "../entities/qr-scan-log.entity"

export interface QRCodeGenerationOptions {
  type: QRCodeType
  referenceId?: string
  description?: string
  expirationHours?: number
  maxScans?: number
  customExpirationDate?: Date
  metadata?: Record<string, any>
  createdBy?: string
}

export interface QRCodeScanOptions {
  scannedBy?: string
  scannedLocation?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface QRCodeValidationResult {
  isValid: boolean
  qrCode?: any
  reason?: string
  scanResult: ScanResult
}

export interface QRCodeImageOptions {
  size?: number
  margin?: number
  errorCorrectionLevel?: "L" | "M" | "Q" | "H"
  type?: "png" | "svg"
  color?: {
    dark?: string
    light?: string
  }
}

export interface QRCodeStatistics {
  totalGenerated: number
  totalScanned: number
  activeCount: number
  expiredCount: number
  usedCount: number
  revokedCount: number
  scansByType: Record<QRCodeType, number>
  scansByResult: Record<ScanResult, number>
}
