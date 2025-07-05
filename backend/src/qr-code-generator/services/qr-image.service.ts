import { Injectable, Logger } from "@nestjs/common"
import * as QRCode from "qrcode"
import type { QRCodeImageOptions } from "../interfaces/qr-generator.interface"

@Injectable()
export class QRImageService {
  private readonly logger = new Logger(QRImageService.name)

  async generateQRCodeImage(data: string, options: QRCodeImageOptions = {}): Promise<string> {
    try {
      const qrOptions = {
        width: options.size || 256,
        margin: options.margin || 2,
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        type: options.type || "png",
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
      }

      if (options.type === "svg") {
        const svgString = await QRCode.toString(data, {
          ...qrOptions,
          type: "svg",
        })
        return `data:image/svg+xml;base64,${Buffer.from(svgString).toString("base64")}`
      }

      const dataUrl = await QRCode.toDataURL(data, qrOptions)
      return dataUrl
    } catch (error) {
      this.logger.error(`Failed to generate QR code image: ${error.message}`)
      throw new Error("Failed to generate QR code image")
    }
  }

  async generateQRCodeBuffer(data: string, options: QRCodeImageOptions = {}): Promise<Buffer> {
    try {
      const qrOptions = {
        width: options.size || 256,
        margin: options.margin || 2,
        errorCorrectionLevel: options.errorCorrectionLevel || "M",
        color: {
          dark: options.color?.dark || "#000000",
          light: options.color?.light || "#FFFFFF",
        },
      }

      return await QRCode.toBuffer(data, qrOptions)
    } catch (error) {
      this.logger.error(`Failed to generate QR code buffer: ${error.message}`)
      throw new Error("Failed to generate QR code buffer")
    }
  }

  async generateMultipleSizes(data: string, sizes: number[] = [128, 256, 512]): Promise<Record<string, string>> {
    const results: Record<string, string> = {}

    for (const size of sizes) {
      try {
        const image = await this.generateQRCodeImage(data, { size })
        results[`${size}px`] = image
      } catch (error) {
        this.logger.warn(`Failed to generate QR code for size ${size}px`)
      }
    }

    return results
  }

  validateQRCodeData(data: string): boolean {
    // Check data length limits
    if (data.length > 2953) {
      // Maximum capacity for QR code with error correction level L
      return false
    }

    if (data.length === 0) {
      return false
    }

    return true
  }

  getOptimalErrorCorrectionLevel(dataLength: number): "L" | "M" | "Q" | "H" {
    // Choose error correction level based on data length and use case
    if (dataLength < 100) return "H" // High correction for short codes
    if (dataLength < 500) return "Q" // Quartile correction for medium codes
    if (dataLength < 1000) return "M" // Medium correction for longer codes
    return "L" // Low correction for maximum capacity
  }

  async generateCustomStyledQR(
    data: string,
    style: {
      logo?: string
      backgroundColor?: string
      foregroundColor?: string
      borderRadius?: number
    } = {},
  ): Promise<string> {
    // Basic implementation - can be extended with more sophisticated styling
    const options: QRCodeImageOptions = {
      size: 256,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: style.foregroundColor || "#000000",
        light: style.backgroundColor || "#FFFFFF",
      },
    }

    return this.generateQRCodeImage(data, options)
  }
}
