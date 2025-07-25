import * as crypto from 'crypto';
import type { WebhookSourceValidator } from '../interfaces/webhook-source.interface';

export class GitHubWebhookValidator implements WebhookSourceValidator {
  validateSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    if (!signature || !signature.startsWith('sha256=')) {
      return false;
    }

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

  extractEventInfo(
    headers: Record<string, string>,
    payload: any,
  ): {
    eventType?: string;
    eventId?: string;
  } {
    return {
      eventType: headers['x-github-event'],
      eventId: headers['x-github-delivery'],
    };
  }

  validateEventType(eventType: string): boolean {
    const allowedEvents = [
      'push',
      'pull_request',
      'issues',
      'issue_comment',
      'pull_request_review',
      'release',
      'deployment',
      'repository',
      'ping',
    ];
    return allowedEvents.includes(eventType);
  }
}
