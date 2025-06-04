import { Injectable, Logger } from "@nestjs/common"
import type { ConfigService } from "@nestjs/config"
import * as crypto from "crypto"

@Injectable()
export class WebhookVerificationService {
  private readonly logger = new Logger(WebhookVerificationService.name)

  constructor(private configService: ConfigService) {}

  verifyStripeSignature(payload: Buffer, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET")

      if (!webhookSecret) {
        this.logger.warn("STRIPE_WEBHOOK_SECRET is not configured")
        return false
      }

      // Split the signature string by commas to get the timestamp and signatures
      const signatureParts = signature.split(",")
      const timestampPart = signatureParts.find((part) => part.startsWith("t="))
      const signaturePart = signatureParts.find((part) => part.startsWith("v1="))

      if (!timestampPart || !signaturePart) {
        return false
      }

      const timestamp = timestampPart.substring(2)
      const signatureValue = signaturePart.substring(3)

      // Create the signature payload
      const signedPayload = `${timestamp}.${payload.toString()}`

      // Compute the expected signature
      const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(signedPayload).digest("hex")

      // Compare the signatures using a constant-time comparison function
      return this.secureCompare(signatureValue, expectedSignature)
    } catch (error) {
      this.logger.error(`Error verifying Stripe signature: ${error.message}`, error.stack)
      return false
    }
  }

  verifyEmailProviderSignature(payload: Record<string, any>, signature: string): boolean {
    try {
      const webhookSecret = this.configService.get<string>("EMAIL_WEBHOOK_SECRET")

      if (!webhookSecret) {
        this.logger.warn("EMAIL_WEBHOOK_SECRET is not configured")
        return false
      }

      // Convert payload to string
      const payloadString = JSON.stringify(payload)

      // Compute the expected signature
      const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(payloadString).digest("hex")

      // Compare the signatures using a constant-time comparison function
      return this.secureCompare(signature, expectedSignature)
    } catch (error) {
      this.logger.error(`Error verifying email provider signature: ${error.message}`, error.stack)
      return false
    }
  }

  // Constant-time comparison function to prevent timing attacks
  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }
}
