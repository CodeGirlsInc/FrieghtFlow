import * as crypto from "crypto"
import type { WebhookSourceValidator } from "../interfaces/webhook-source.interface"

export class StripeWebhookValidator implements WebhookSourceValidator {
  validateSignature(payload: string, signature: string, secret: string): boolean {
    if (!signature) {
      return false
    }

    const elements = signature.split(",")
    const signatureElements: Record<string, string> = {}

    for (const element of elements) {
      const [key, value] = element.split("=")
      signatureElements[key] = value
    }

    if (!signatureElements.t || !signatureElements.v1) {
      return false
    }

    const timestamp = signatureElements.t
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${timestamp}.${payload}`, "utf8")
      .digest("hex")

    return crypto.timingSafeEqual(Buffer.from(expectedSignature, "hex"), Buffer.from(signatureElements.v1, "hex"))
  }

  extractEventInfo(
    headers: Record<string, string>,
    payload: any,
  ): {
    eventType?: string
    eventId?: string
  } {
    return {
      eventType: payload?.type,
      eventId: payload?.id,
    }
  }

  validateEventType(eventType: string): boolean {
    const allowedEvents = [
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "customer.created",
      "customer.updated",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
      "subscription.created",
      "subscription.updated",
      "subscription.deleted",
    ]
    return allowedEvents.includes(eventType)
  }
}
