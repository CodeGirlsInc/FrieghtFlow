import { ApiProperty } from "@nestjs/swagger"
import { QRCodeType, QRCodeStatus } from "../entities/qr-code.entity"

export class QRCodeResponseDto {
  @ApiProperty({ description: "QR code ID", example: "uuid-123" })
  id: string

  @ApiProperty({ description: "QR code string", example: "QR_abc123def456" })
  code: string

  @ApiProperty({ description: "QR code type", enum: QRCodeType })
  type: QRCodeType

  @ApiProperty({ description: "QR code status", enum: QRCodeStatus })
  status: QRCodeStatus

  @ApiProperty({ description: "Reference ID", example: "shipment-123" })
  referenceId: string

  @ApiProperty({ description: "Description", example: "Delivery validation QR code" })
  description: string

  @ApiProperty({ description: "Expiration date", example: "2024-12-31T23:59:59Z" })
  expiresAt: Date

  @ApiProperty({ description: "Number of scans performed", example: 0 })
  scanCount: number

  @ApiProperty({ description: "Maximum scans allowed", example: 1 })
  maxScans: number

  @ApiProperty({ description: "Creation date", example: "2024-01-01T00:00:00Z" })
  createdAt: Date

  @ApiProperty({
    description: "Base64 encoded QR code image",
    example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  })
  qrCodeImage: string
}
