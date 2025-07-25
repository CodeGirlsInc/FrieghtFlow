import * as crypto from 'crypto';
import type { WebhookSourceValidator } from '../interfaces/webhook-source.interface';

export class GenericWebhookValidator implements WebhookSourceValidator {
  validateSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature || !secret) {
      return true; // Skip validation if no signature or secret provided
    }

    // Support multiple signature formats
    if (signature.startsWith('sha256=')) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');
      const receivedSignature = signature.replace('sha256=', '');
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex'),
      );
    }

    if (signature.startsWith('sha1=')) {
      const expectedSignature = crypto
        .createHmac('sha1', secret)
        .update(payload, 'utf8')
        .digest('hex');
      const receivedSignature = signature.replace('sha1=', '');
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(receivedSignature, 'hex'),
      );
    }

    // Direct comparison for simple tokens
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(secret));
  }

  extractEventInfo(
    headers: Record<string, string>,
    payload: any,
  ): {
    eventType?: string;
    eventId?: string;
  } {
    return {
      eventType:
        headers['x-event-type'] || payload?.event_type || payload?.type,
      eventId: headers['x-event-id'] || payload?.event_id || payload?.id,
    };
  }

  validateEventType(eventType: string): boolean {
    // Generic validator accepts all event types
    return true;
  }
}
