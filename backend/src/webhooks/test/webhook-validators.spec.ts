import { GitHubWebhookValidator } from "../validators/github-webhook.validator"
import { StripeWebhookValidator } from "../validators/stripe-webhook.validator"
import { GenericWebhookValidator } from "../validators/generic-webhook.validator"
import * as crypto from "crypto"

describe("Webhook Validators", () => {
  describe("GitHubWebhookValidator", () => {
    let validator: GitHubWebhookValidator

    beforeEach(() => {
      validator = new GitHubWebhookValidator()
    })

    describe("validateSignature", () => {
      it("should validate correct GitHub signature", () => {
        const payload = '{"ref":"refs/heads/main"}'
        const secret = "my-secret"
        const expectedSignature = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex")
        const signature = `sha256=${expectedSignature}`

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(true)
      })

      it("should reject invalid GitHub signature", () => {
        const payload = '{"ref":"refs/heads/main"}'
        const secret = "my-secret"
        const signature = "sha256=invalid-signature"

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(false)
      })

      it("should reject signature without sha256 prefix", () => {
        const payload = '{"ref":"refs/heads/main"}'
        const secret = "my-secret"
        const signature = "invalid-format"

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(false)
      })
    })

    describe("extractEventInfo", () => {
      it("should extract GitHub event information", () => {
        const headers = {
          "x-github-event": "push",
          "x-github-delivery": "12345-67890",
        }
        const payload = {}

        const result = validator.extractEventInfo(headers, payload)

        expect(result).toEqual({
          eventType: "push",
          eventId: "12345-67890",
        })
      })
    })

    describe("validateEventType", () => {
      it("should validate allowed GitHub event types", () => {
        expect(validator.validateEventType("push")).toBe(true)
        expect(validator.validateEventType("pull_request")).toBe(true)
        expect(validator.validateEventType("issues")).toBe(true)
        expect(validator.validateEventType("ping")).toBe(true)
      })

      it("should reject disallowed GitHub event types", () => {
        expect(validator.validateEventType("unknown_event")).toBe(false)
        expect(validator.validateEventType("")).toBe(false)
      })
    })
  })

  describe("StripeWebhookValidator", () => {
    let validator: StripeWebhookValidator

    beforeEach(() => {
      validator = new StripeWebhookValidator()
    })

    describe("validateSignature", () => {
      it("should validate correct Stripe signature", () => {
        const payload = '{"type":"payment_intent.succeeded"}'
        const secret = "whsec_test_secret"
        const timestamp = Math.floor(Date.now() / 1000).toString()
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(`${timestamp}.${payload}`, "utf8")
          .digest("hex")
        const signature = `t=${timestamp},v1=${expectedSignature}`

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(true)
      })

      it("should reject invalid Stripe signature", () => {
        const payload = '{"type":"payment_intent.succeeded"}'
        const secret = "whsec_test_secret"
        const signature = "t=1234567890,v1=invalid-signature"

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(false)
      })
    })

    describe("extractEventInfo", () => {
      it("should extract Stripe event information", () => {
        const headers = {}
        const payload = {
          type: "payment_intent.succeeded",
          id: "evt_1234567890",
        }

        const result = validator.extractEventInfo(headers, payload)

        expect(result).toEqual({
          eventType: "payment_intent.succeeded",
          eventId: "evt_1234567890",
        })
      })
    })

    describe("validateEventType", () => {
      it("should validate allowed Stripe event types", () => {
        expect(validator.validateEventType("payment_intent.succeeded")).toBe(true)
        expect(validator.validateEventType("customer.created")).toBe(true)
        expect(validator.validateEventType("subscription.updated")).toBe(true)
      })

      it("should reject disallowed Stripe event types", () => {
        expect(validator.validateEventType("unknown.event")).toBe(false)
        expect(validator.validateEventType("")).toBe(false)
      })
    })
  })

  describe("GenericWebhookValidator", () => {
    let validator: GenericWebhookValidator

    beforeEach(() => {
      validator = new GenericWebhookValidator()
    })

    describe("validateSignature", () => {
      it("should validate sha256 signature", () => {
        const payload = '{"event":"test"}'
        const secret = "my-secret"
        const expectedSignature = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex")
        const signature = `sha256=${expectedSignature}`

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(true)
      })

      it("should validate sha1 signature", () => {
        const payload = '{"event":"test"}'
        const secret = "my-secret"
        const expectedSignature = crypto.createHmac("sha1", secret).update(payload, "utf8").digest("hex")
        const signature = `sha1=${expectedSignature}`

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(true)
      })

      it("should validate direct token comparison", () => {
        const payload = '{"event":"test"}'
        const secret = "my-token"
        const signature = "my-token"

        const result = validator.validateSignature(payload, signature, secret)

        expect(result).toBe(true)
      })

      it("should skip validation when no signature or secret", () => {
        const payload = '{"event":"test"}'

        expect(validator.validateSignature(payload, "", "")).toBe(true)
        expect(validator.validateSignature(payload, "sig", "")).toBe(true)
        expect(validator.validateSignature(payload, "", "secret")).toBe(true)
      })
    })

    describe("extractEventInfo", () => {
      it("should extract event info from headers", () => {
        const headers = {
          "x-event-type": "user.created",
          "x-event-id": "event-123",
        }
        const payload = {}

        const result = validator.extractEventInfo(headers, payload)

        expect(result).toEqual({
          eventType: "user.created",
          eventId: "event-123",
        })
      })

      it("should extract event info from payload", () => {
        const headers = {}
        const payload = {
          event_type: "user.updated",
          event_id: "event-456",
        }

        const result = validator.extractEventInfo(headers, payload)

        expect(result).toEqual({
          eventType: "user.updated",
          eventId: "event-456",
        })
      })
    })

    describe("validateEventType", () => {
      it("should accept all event types", () => {
        expect(validator.validateEventType("any.event")).toBe(true)
        expect(validator.validateEventType("custom_event")).toBe(true)
        expect(validator.validateEventType("")).toBe(true)
      })
    })
  })
})
