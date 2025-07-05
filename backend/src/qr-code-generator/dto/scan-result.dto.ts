import { ApiProperty } from "@nestjs/swagger"
import { ScanResult } from "../entities/qr-scan-log.entity"
import type { QRCodeType } from "../entities/qr-code.entity"

export class ScanResultDto {
  @ApiProperty({ description: "Scan result", enum: ScanResult })
  result: ScanResult

  @ApiProperty({ description: "Success indicator", example: true })
  success: boolean

  @ApiProperty({ description: "Result message", example: "QR code scanned successfully" })
  message: string

  @ApiProperty({ description: "QR code details if scan was successful" })
  qrCode?: {
    id: string
    type: QRCodeType
    referenceId: string
    description: string
    scanCount: number
    maxScans: number
    metadata: Record<string, any>
  }

  @ApiProperty({ description: "Scan timestamp", example: "2024-01-01T12:00:00Z" })
  scannedAt: Date
}
