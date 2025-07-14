import { Injectable } from "@nestjs/common"
import { createHash, randomBytes } from "crypto"

@Injectable()
export class QRHashService {
  private readonly algorithm = "sha256"
  private readonly prefix = "QR_"

  generateUniqueCode(): string {
    const timestamp = Date.now().toString()
    const randomData = randomBytes(16).toString("hex")
    const combinedData = `${timestamp}-${randomData}`

    const hash = createHash(this.algorithm).update(combinedData).digest("hex").substring(0, 12) // Take first 12 characters for readability

    return `${this.prefix}${hash}`
  }

  generateSecureHash(data: string): string {
    return createHash(this.algorithm).update(data).digest("hex")
  }

  verifyHash(data: string, hash: string): boolean {
    const computedHash = this.generateSecureHash(data)
    return computedHash === hash
  }

  generateCodeWithChecksum(baseData: string): string {
    const timestamp = Date.now().toString()
    const randomSalt = randomBytes(8).toString("hex")
    const combinedData = `${baseData}-${timestamp}-${randomSalt}`

    const hash = createHash(this.algorithm).update(combinedData).digest("hex").substring(0, 16)

    // Add checksum for additional validation
    const checksum = this.calculateChecksum(hash)

    return `${this.prefix}${hash}${checksum}`
  }

  validateCodeFormat(code: string): boolean {
    if (!code.startsWith(this.prefix)) {
      return false
    }

    const codeWithoutPrefix = code.substring(this.prefix.length)

    // Check minimum length (hash + checksum)
    if (codeWithoutPrefix.length < 18) {
      return false
    }

    // Validate checksum if present
    if (codeWithoutPrefix.length >= 18) {
      const hash = codeWithoutPrefix.substring(0, 16)
      const providedChecksum = codeWithoutPrefix.substring(16, 18)
      const calculatedChecksum = this.calculateChecksum(hash)

      return providedChecksum === calculatedChecksum
    }

    return true
  }

  private calculateChecksum(data: string): string {
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i)
    }
    return (sum % 256).toString(16).padStart(2, "0")
  }

  generateSecureToken(length = 32): string {
    return randomBytes(length).toString("hex")
  }

  hashSensitiveData(data: string, salt?: string): string {
    const actualSalt = salt || randomBytes(16).toString("hex")
    return createHash(this.algorithm)
      .update(data + actualSalt)
      .digest("hex")
  }
}
